# ==============================================================================
# Simantrix Dashboard — Next.js 16 Admin Console
# Multi-stage Dockerfile optimized for pnpm, standalone output & small footprint
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Alpine image with Corepack & pnpm enabled
# ------------------------------------------------------------------------------
FROM node:26-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.20.0
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ------------------------------------------------------------------------------
# Stage 2: Install all dependencies
# ------------------------------------------------------------------------------
FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 3: Build the Next.js production bundle (standalone mode)
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs ./
COPY src ./src
COPY public ./public

# Build-time env vars needed by Next.js for client-side code
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Next.js telemetry opt-out
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ------------------------------------------------------------------------------
# Stage 4: Lean production runtime container
# ------------------------------------------------------------------------------
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime utilities: dumb-init (signal forwarding), curl (health checks)
RUN apk add --no-cache \
    dumb-init \
    curl \
    libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Run as non-privileged user
USER nextjs

# Expose dashboard port
EXPOSE 4100

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:4100/ || exit 1

# Signal-aware entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the standalone Next.js server
CMD ["node", "server.js"]
