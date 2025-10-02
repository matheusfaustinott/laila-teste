
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init netcat-openbsd wget
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
