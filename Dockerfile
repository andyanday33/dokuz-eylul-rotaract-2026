# syntax=docker/dockerfile:1.7
#
# Two things are built from this file, and `scripts/deploy.sh` runs them in a
# fixed order for a reason:
#
#   --target migrator   applies the Payload migrations
#   --target runner     the image that serves the site
#
# The order is migrate first, then build. `next build` prerenders the public
# pages by querying Payload, so it reads the database rather than merely
# connecting to it. Building before migrating would render every page against
# the old schema — silently, since the query would still succeed — and ship a
# site missing whatever the migration added.

ARG NODE_VERSION=22

# --------------------------------------------------------------------------
# deps — installed once, cached until package-lock.json changes
# --------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
# sharp's prebuilt musl binaries need the glibc compatibility shim; Payload
# uses sharp to cut the 800px portrait crops on upload.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# devDependencies included: TypeScript is what compiles payload.config.ts, and
# both the migrator and the build need it.
RUN npm ci

# --------------------------------------------------------------------------
# source — deps plus the repository, shared by the two targets below
# --------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS source
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --------------------------------------------------------------------------
# migrator — run once per deploy, before the build
# --------------------------------------------------------------------------
# NODE_ENV is deliberately left unset: Payload's CLI loads payload.config.ts
# through its own TypeScript pipeline, and this stage exists only to reach the
# database. `push: false` in the config is what keeps this from becoming an
# unrecorded schema change — see the comment there.
FROM source AS migrator
ENTRYPOINT ["node", "./node_modules/payload/bin.js"]
CMD ["migrate"]

# --------------------------------------------------------------------------
# builder
# --------------------------------------------------------------------------
FROM source AS builder

# Inlined into the client bundle by Next, so these are public by definition and
# are passed as plain build arguments.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# The site's own origin, and it has to be here rather than only at runtime.
# The public pages are prerendered, so their canonical URL, hreflang set and
# Open Graph tags are written during this build — see the comment in
# lib/seo.ts. Left unset, every page ships claiming to live at
# http://localhost:3000, which is invisible rather than broken: the site looks
# perfect and search engines index nothing.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# The database connection string and the Payload secret are mounted for the
# length of this one command and never land in a layer, so they cannot be read
# back out of the image with `docker history`. An ARG would be visible there.
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=PAYLOAD_SECRET \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    PAYLOAD_SECRET="$(cat /run/secrets/PAYLOAD_SECRET)" \
    npm run build

# --------------------------------------------------------------------------
# runner — what actually ships
# --------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind on every interface. The default is localhost, which inside a container
# means nothing outside it can reach the port.
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# `output: "standalone"` traces the server and only the node_modules it
# actually reaches, but leaves these two for the image to place: the static
# chunks, which are served from disk rather than imported, and public/.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uploads land here. Created and owned before the drop to `nextjs`, because a
# named volume mounted over an empty directory inherits that directory's
# ownership — without this Payload cannot write the first portrait.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

# `robots.txt` is prerendered and touches neither the database nor the session,
# so a passing check means the server is serving rather than that Supabase
# happens to be reachable. Node 22 has fetch built in, which saves installing
# curl into the runtime image for this one line.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
