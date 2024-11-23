FROM node:22-alpine AS base

WORKDIR /usr/src/app

ENV PNPM_HOME='/pnpm'
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dependencies AS build

COPY ./src ./src
COPY ./tsconfig.json ./

RUN pnpm exec esbuild src/index.ts \
  --bundle \
  --minify \
  --sourcemap \
  --platform=node \
  --target=es2022 \
  --outdir=dist

FROM node:22-alpine AS application

ENV PORT=3000

COPY --from=build /usr/src/app/dist ./dist

ENTRYPOINT [ "node" ]

CMD [ "dist/index.js" ]
