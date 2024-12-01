# Stage 1: Base setup
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Set up pnpm and environment paths
ENV PNPM_HOME='/pnpm'
ENV PATH="$PNPM_HOME:$PATH"

# Enable Corepack for package manager compatibility
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install global Nx CLI
RUN pnpm add -g nx

# Stage 2: Install dependencies
FROM base AS dependencies

# Copy workspace files required for dependency installation
COPY nx.json pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy only relevant `package.json` files from projects
COPY apps/video-streaming/package.json ./apps/video-streaming/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies with pnpm and use cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Stage 3: Build application
FROM dependencies AS build

# Copy the full workspace
COPY . .

# Build the target project using Nx
RUN pnpm nx build video-streaming --skip-nx-cache

# Stage 4: Production-ready image
FROM node:22-alpine AS application

WORKDIR /usr/src/app

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist/apps/video-streaming ./dist

# Set environment variables and expose the port
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["dist/main.js"]

# Stage 5: Local development
FROM base AS local

WORKDIR /usr/src/app

# Copy dependencies and source files for development
COPY --from=dependencies /usr/src/app /usr/src/app
# COPY apps/video-streaming ./apps/video-streaming
COPY packages/shared ./packages/shared

# Add tsx for TypeScript development
RUN pnpm add -g tsx

# Use tsx for hot-reloading during development
ENTRYPOINT ["tsx", "watch", "apps/video-streaming/src/index.ts"]
