# Multi-stage build para React
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala dependências
RUN npm ci --silent

# Copia código fonte
COPY . .

# Build da aplicação React
RUN npm run build

# Estágio de produção com nginx
FROM nginx:alpine AS production

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Remove configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copia build da aplicação
COPY --from=builder /app/build /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
