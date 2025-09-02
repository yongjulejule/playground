# STAGE 1: Builder
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY schema.prisma ./
RUN npx prisma generate

# STAGE 2: Final Image
FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/schema.prisma ./
COPY index.js .

# --expose-gc 플래그와 함께 스크립트 실행
CMD ["node", "--expose-gc", "index.js"]
