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

  info "docker $(docker version --format '{{.Server.Version}}')"
  info "compose $(docker compose version --short)"
  info "release $(git rev-parse --short HEAD 2>/dev/null || echo 'not a git checkout')"
}

# ---------------------------------------------------------------------------
# Migrate, then build
# ---------------------------------------------------------------------------
migrate() {
  step "Applying database migrations"

  DOCKER_BUILDKIT=1 docker build ${NO_CACHE[@]+"${NO_CACHE[@]}"} --target migrator -t "$IMAGE:migrator" . \
    || die "could not build the migrator image."

  # --rm because this container has done its job the moment it exits; the
  # migrations it applied live in Postgres, not here.
  docker run --rm \
    -e DATABASE_URL \
    -e PAYLOAD_SECRET \
    "$IMAGE:migrator" migrate \
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

  printf '\n%sLive.%s %s\n\n' "$GRN$B" "$OFF" \
    "http://127.0.0.1:${PORT:-3000} — behind whatever proxy terminates TLS."
}

main "$@"
