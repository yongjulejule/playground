# Stage 1: Base setup
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Set up pnpm and path environment
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Enable Corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Install dependencies
FROM base AS dependencies

# Copy workspace metadata for dependency installation
COPY nx.json pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/history/package.json ./apps/history/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies with pnpm
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

# Stage 3: Local development environment
FROM dependencies AS local

# Install tsx globally for live development
RUN pnpm add -g tsx

# Use hot-reloading
WORKDIR /usr/src/app/apps/history
ENTRYPOINT ["tsx", "watch", "src/index.ts"]

# Stage 4: Production build
FROM dependencies AS build

# Copy the entire workspace and build
COPY . .
RUN pnpm --filter '@video-platform/history'  build

# Stage 5: Production-ready image
FROM node:22-alpine AS prod

WORKDIR /usr/src/app

# Copy built application
COPY --from=build /usr/src/app/apps/history/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the production application
CMD ["node", "dist/index.js"]
