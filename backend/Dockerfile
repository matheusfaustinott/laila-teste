# Multi-stage build para otimizar a imagem
FROM node:18-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências incluindo devDependencies para o build
RUN npm ci

# Copia código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instala dependências do sistema
RUN apk add --no-cache dumb-init netcat-openbsd wget

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Diretório de trabalho
WORKDIR /app

# Copia package.json e instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia build do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database

# Copia script de inicialização
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Muda para usuário não-root
USER nodejs

# Expõe a porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
