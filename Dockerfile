# ─────────────────────────────────────────────────────────────
#  Eka Research — Multi-stage Dockerfile
# ─────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# ── Stage 2: build app ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Prisma generate only reads the schema — no DB connection needed.
RUN npx prisma generate

# Provide a dummy DATABASE_URL so the Prisma lazy-proxy doesn't throw at
# module-import time. generateStaticParams() wraps its DB call in try/catch,
# so no real connection is attempted during the build.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL

RUN npm run build

# ── Stage 3: migration runner ────────────────────────────────
FROM node:20-alpine AS migrator

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Full dev+prod dependencies (needed for tsx, prisma CLI, bcryptjs, etc.)
COPY --from=deps /app/node_modules ./node_modules

# Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Package files
COPY package.json ./
COPY package-lock.json ./

# Generate Prisma client inside the migrator image
RUN npx prisma generate

# Only run schema migrations — do NOT seed in production.
# Seed via: docker compose run --rm migrator npx tsx prisma/seed.ts
CMD ["npx", "prisma", "migrate", "deploy"]

# ── Stage 4: production runner ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Next standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma runtime files
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# PG runtime deps
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg            ./node_modules/pg
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-pool       ./node_modules/pg-pool
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pgpass        ./node_modules/pgpass
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-array    ./node_modules/postgres-array
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-bytea    ./node_modules/postgres-bytea
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-date     ./node_modules/postgres-date
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres-interval ./node_modules/postgres-interval

RUN mkdir -p .next && chown nextjs:nodejs .next

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
