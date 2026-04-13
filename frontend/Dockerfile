# --- Multi-stage: Full build inside Docker (for CI/CD) ---
# To use: docker build --target runner .

# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set network-timeout 120000 && \
    pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://ethicline-api.localhost
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm build

# Stage 3: Runtime (used by both full-build and local-build)
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# --- Local-build: Skip pnpm install + build, just copy pre-built output ---
# To use: docker build --target local -f Dockerfile .
# Requires: pnpm build was already run locally

FROM node:22-alpine AS local

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
