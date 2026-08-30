#!/usr/bin/env bash
#
# Deploy the site. Run from anywhere; it works from the repository root.
#
#   ./scripts/deploy.sh              build, migrate, release
#   ./scripts/deploy.sh --no-cache   same, ignoring the Docker layer cache
#   ./scripts/deploy.sh --rollback   put the previous image back
#
# The order below is the point of the script. Migrations run before the build
# because `next build` prerenders the public pages by querying Payload: build
# first and every page is rendered against the old schema, successfully and
# wrongly. The release only replaces the running container once the new image
# has answered a health check, and puts the old one back if it does not.

# Started with `sh deploy.sh` this would run under dash on Ubuntu, which has no
# arrays and no ${BASH_SOURCE} — and says so as "Bad substitution" on line 17,
# which is not a useful way to learn you used the wrong interpreter. Re-exec
# under bash rather than make anyone work that out. Everything above, including
# this block, is POSIX, so dash gets this far before handing over.
if [ -z "${BASH_VERSION:-}" ]; then
  command -v bash >/dev/null 2>&1 || {
    echo "This script needs bash. Install it: apt-get install -y bash" >&2
    exit 1
  }
  exec bash "$0" "$@"
fi

set -Eeuo pipefail

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

readonly IMAGE="${IMAGE_NAME:-rotaract-frontend}"
readonly CURRENT="$IMAGE:current"
readonly PREVIOUS="$IMAGE:previous"
readonly REQUIRED=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_SECRET_KEY
  DATABASE_URL
  PAYLOAD_SECRET
)
readonly HEALTH_TIMEOUT=120

# Set by preflight, read by the closing message. Initialised here rather than
# in main() so that `set -u` has something to find on the path where preflight
# never assigns it — which is the successful one.
SITE_URL_MISSING=0

# Colour only when a person is watching; CI logs keep the escape codes out.
if [[ -t 1 ]]; then
  readonly B=$'\033[1m' DIM=$'\033[2m' RED=$'\033[31m' GRN=$'\033[32m' OFF=$'\033[0m'
else
  readonly B='' DIM='' RED='' GRN='' OFF=''
fi

step() { printf '\n%s==>%s %s%s%s\n' "$GRN" "$OFF" "$B" "$*" "$OFF"; }
info() { printf '    %s%s%s\n' "$DIM" "$*" "$OFF"; }
die()  { printf '\n%sDeploy stopped:%s %s\n' "$RED" "$OFF" "$*" >&2; exit 1; }

compose() { docker compose "$@"; }

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
preflight() {
  step "Checking the machine"

  command -v docker >/dev/null || die "docker is not installed."
  docker info >/dev/null 2>&1 || die "the Docker daemon is not reachable. Is it running?"
  docker compose version >/dev/null 2>&1 ||
    die "the 'docker compose' plugin is missing. Install Compose v2."

  # Not optional, and not merely a faster builder: the build mounts
  # DATABASE_URL and PAYLOAD_SECRET as BuildKit secrets, which is what keeps
  # them out of the image's layers. The legacy builder has no equivalent — the
  # only way to pass them without buildx is a build argument, which
  # `docker history` then reads straight back out. Checked here rather than
  # discovered part-way into a build.
  docker buildx version >/dev/null 2>&1 || die "the buildx plugin is missing, and the build needs it to mount secrets.

       With a working apt:
         apt-get update && apt-get install -y docker-buildx-plugin

       Or drop the binary in directly — buildx is one static file, and this
       works on a host whose apt is broken or whose release has gone EOL:
         mkdir -p ~/.docker/cli-plugins
         V=\$(curl -fsSL https://api.github.com/repos/docker/buildx/releases/latest | sed -n 's/.*\"tag_name\": \"\\([^\"]*\\)\".*/\\1/p')
         curl -fsSL \"https://github.com/docker/buildx/releases/download/\$V/buildx-\$V.linux-amd64\" -o ~/.docker/cli-plugins/docker-buildx
         chmod +x ~/.docker/cli-plugins/docker-buildx
         docker buildx version"

  [[ -f .env ]] || die ".env not found in $ROOT. Copy .env.example and fill it in."

  # Read the deployment's own configuration file. `set -a` exports each
  # assignment so the build and Compose both see it.
  set -a
  # shellcheck disable=SC1091
  source ./.env
  set +a

  local missing=()
  for key in "${REQUIRED[@]}"; do
    [[ -n "${!key:-}" ]] || missing+=("$key")
  done
  (( ${#missing[@]} == 0 )) || die ".env is missing: ${missing[*]}"

  # Not in REQUIRED: the site runs without it. But it is baked into every
  # prerendered page's canonical URL at build time, so a deploy without it
  # publishes a site that tells search engines it lives on localhost. Warned
  # about here and again at the end, because the end is what gets read.
  if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
    SITE_URL_MISSING=1
    printf '    %sNEXT_PUBLIC_SITE_URL is not set — canonical URLs will say localhost.%s\n' "$RED" "$OFF"
  elif [[ ! "$NEXT_PUBLIC_SITE_URL" =~ ^https?://[A-Za-z0-9] ]]; then
    # `new URL()` in lib/seo.ts needs a scheme, and a bare host does not have
    # one. Fatal rather than a warning: the build gets through compiling and
    # typechecking before prerendering reaches generateMetadata and throws
    # `TypeError: Invalid URL`, which on a small box is two minutes spent to
    # learn that eight characters are missing.
    die "NEXT_PUBLIC_SITE_URL is '$NEXT_PUBLIC_SITE_URL', which has no scheme.
       It is handed to new URL() when the pages are prerendered, so it needs the
       protocol:  NEXT_PUBLIC_SITE_URL=https://$NEXT_PUBLIC_SITE_URL"
  fi

  info "docker $(docker version --format '{{.Server.Version}}')"
  info "compose $(docker compose version --short)"
  info "release $(git rev-parse --short HEAD 2>/dev/null || echo 'not a git checkout')"
}

# ---------------------------------------------------------------------------
# Migrate, then build
# ---------------------------------------------------------------------------
# What is on disk that the database has not recorded, and whether Payload's
# dev-push marker is still sitting in the table.
#
# Asked directly rather than by running `migrate` and seeing what it says,
# because `migrate` is interactive: with the marker present it stops on a
# yes/no prompt about data loss, which a deploy has no way to answer and no
# business answering. Knowing there is nothing to apply means never reaching
# that question.
survey_migrations() {
  docker run --rm -e DATABASE_URL --entrypoint node "$IMAGE:migrator" -e '
    const fs = require("fs"), pg = require("pg");
    (async () => {
      const files = fs.readdirSync("/app/cms/migrations")
        .filter((f) => f.endsWith(".ts") && f !== "index.ts")
        .map((f) => f.slice(0, -3));
      const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
      await c.connect();
      const applied = await c.query(
        "select name, batch from payload.payload_migrations",
      );
      await c.end();
      const done = new Set(applied.rows.filter((r) => r.batch >= 0).map((r) => r.name));
      const marker = applied.rows.some((r) => r.batch < 0) ? "1" : "0";
      console.log(files.filter((f) => !done.has(f)).length + " " + marker);
    })().catch((e) => { console.error(e.message); process.exit(1); });
  '
}

migrate() {
  step "Checking database migrations"

  DOCKER_BUILDKIT=1 docker build ${NO_CACHE[@]+"${NO_CACHE[@]}"} --target migrator -t "$IMAGE:migrator" . \
    || die "could not build the migrator image."

  local survey pending marker
  survey="$(survey_migrations)" || die "could not read the migration table. Is DATABASE_URL right, and is Supabase reachable from this host?"
  pending="${survey% *}"
  marker="${survey#* }"

  if (( marker )); then
    printf '    %sPayload'"'"'s dev-push marker is still in payload_migrations.%s\n' "$RED" "$OFF"
    printf '    %sIt makes `migrate` stop on a data-loss prompt. Clearing it is one row:%s\n' "$DIM" "$OFF"
    printf '    %sdelete from payload.payload_migrations where batch < 0;%s\n' "$DIM" "$OFF"
  fi

  if (( pending == 0 )); then
    info "schema is up to date — nothing to apply"
    return 0
  fi

  info "$pending migration(s) to apply"
  (( marker == 0 )) || die "$pending migration(s) are pending, but the dev-push marker above would turn this into an interactive data-loss prompt. Clear the marker first, then deploy again."

  # --rm because this container has done its job the moment it exits; the
  # migrations it applied live in Postgres, not here.
  #
  # stdin is closed deliberately. Without `-i` the container has no stdin to
  # read anyway, so anything that stops to ask a question renders the prompt,
  # ignores every keystroke — the terminal echoes them, which makes it look
  # like it is listening — and waits forever. Handing it EOF turns that hang
  # into an error the `|| die` below can report. The survey above is what
  # keeps it from being asked in the first place.
  docker run --rm \
    -e DATABASE_URL \
    -e PAYLOAD_SECRET \
    "$IMAGE:migrator" migrate < /dev/null \
    || die "migrations failed. The database is unchanged past the last successful one, and nothing has been released."
}

build() {
  step "Building the site"
  info "prerendering runs against the schema just migrated"

  # The two secrets are piped in rather than passed as build args, so they are
  # mounted for one RUN and never recorded in the image's history.
  DOCKER_BUILDKIT=1 docker build ${NO_CACHE[@]+"${NO_CACHE[@]}"} \
    --target runner \
    --build-arg "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" \
    --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
    --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-}" \
    --secret "id=DATABASE_URL,env=DATABASE_URL" \
    --secret "id=PAYLOAD_SECRET,env=PAYLOAD_SECRET" \
    -t "$IMAGE:build" \
    . || die "the build failed. Nothing has been released; the running site is untouched."
}

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------
release() {
  step "Releasing"

  # Keep whatever is live now, so a failed health check has something to go
  # back to. On the very first deploy there is nothing to keep.
  if docker image inspect "$CURRENT" >/dev/null 2>&1; then
    docker tag "$CURRENT" "$PREVIOUS"
    info "previous image kept as $PREVIOUS"
  else
    info "first release — no previous image to fall back to"
  fi

  docker tag "$IMAGE:build" "$CURRENT"
  compose up -d --force-recreate web || die "compose could not start the new container."
}

# Poll the container's own health check rather than the port: Compose reports
# `healthy` only once the command inside the container has passed, which is a
# stronger claim than the socket being open.
await_health() {
  step "Waiting for the new container to report healthy"

  local waited=0 state running
  while (( waited < HEALTH_TIMEOUT )); do
    state="$(docker inspect -f '{{.State.Health.Status}}' rotaract-web 2>/dev/null || echo pending)"
    case "$state" in
      healthy)
        printf '    %shealthy after %ss%s\n' "$DIM" "$waited" "$OFF"
        return 0
        ;;
      unhealthy)
        printf '    %sthe health check inside the container failed%s\n' "$DIM" "$OFF"
        return 1
        ;;
      pending)
        # Either Docker has not attached the health state yet — a real window
        # of a second or two after `up -d` — or the container has already
        # exited. Only the second is a failure, so ask which it is rather than
        # rolling back on a container that is merely still starting.
        running="$(docker inspect -f '{{.State.Running}}' rotaract-web 2>/dev/null || echo false)"
        if [[ "$running" != "true" ]] && (( waited > 6 )); then
          printf '    %sthe container is not running%s\n' "$DIM" "$OFF"
          return 1
        fi
        ;;
    esac
    sleep 3
    waited=$(( waited + 3 ))
  done

  printf '    %sstill %s after %ss%s\n' "$DIM" "$state" "$HEALTH_TIMEOUT" "$OFF"
  return 1
}

# `asked` when a person ran --rollback, `failed` when a deploy could not come
# up. The work is identical; what differs is whether this is bad news and what
# the exit status should be.
rollback() {
  local reason="${1:-failed}"
  step "Rolling back"

  if ! docker image inspect "$PREVIOUS" >/dev/null 2>&1; then
    compose logs --tail 40 web 2>/dev/null || true
    die "there is no previous image to restore. The last 40 lines of the container log are above."
  fi

  docker tag "$PREVIOUS" "$CURRENT"
  compose up -d --force-recreate web

  if [[ "$reason" == "asked" ]]; then
    printf '\n%sRolled back.%s The previous image is serving again.\n\n' "$GRN$B" "$OFF"
    exit 0
  fi

  printf '\n%sRolled back to the previous image.%s The build that would not start is still tagged %s:build — `docker compose logs web` says why.\n\n' \
    "$B" "$OFF" "$IMAGE"
  exit 1
}

# ---------------------------------------------------------------------------
# Housekeeping
# ---------------------------------------------------------------------------
cleanup() {
  step "Tidying up"
  docker image rm "$IMAGE:build" "$IMAGE:migrator" >/dev/null 2>&1 || true
  # Only layers belonging to no tagged image. `:previous` is still tagged, so
  # the way back survives this.
  docker image prune -f >/dev/null 2>&1 || true
  info "dangling layers removed; $PREVIOUS kept"
}

# ---------------------------------------------------------------------------
main() {
  # Expanded below as ${NO_CACHE[@]+"..."} rather than "${NO_CACHE[@]}":
  # bash 3.2, which is what macOS still ships, calls the latter an unbound
  # variable when the array is empty and `set -u` is on.
  local -a NO_CACHE=()
  case "${1:-}" in
    --no-cache) NO_CACHE=(--no-cache) ;;
    --rollback) preflight; rollback asked ;;
    --help|-h)  sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    "")         ;;
    *)          die "unknown option '$1'. Try --help." ;;
  esac

  preflight
  migrate
  build
  release

  if ! await_health; then
    rollback failed
  fi

  cleanup

  printf '\n%sLive.%s %s\n' "$GRN$B" "$OFF" \
    "http://127.0.0.1:${PORT:-3000} — behind whatever proxy terminates TLS."

  if (( SITE_URL_MISSING )); then
    printf '\n%sOne thing before you announce it.%s NEXT_PUBLIC_SITE_URL was not set,\nso every page it just built names http://localhost:3000 as its canonical\nURL. Put the real origin in .env and deploy again — it is read at build\ntime, so restarting the container will not pick it up.\n' "$RED$B" "$OFF"
  fi
  printf '\n'
}

main "$@"
