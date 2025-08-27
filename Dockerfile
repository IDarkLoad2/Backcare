# Use Node.js 18 Alpine para uma imagem mais leve
FROM node:18-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache dumb-init

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Stage para dependências de produção
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage para desenvolvimento (opcional)
FROM base AS dev-dependencies
RUN npm ci

# Stage final de produção
FROM base AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copiar dependências de produção
COPY --from=dependencies --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodeuser:nodejs . .

# Mudar para usuário não-root
USER nodeuser

# Expor a porta
EXPOSE 5000

# Usar dumb-init para gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "server.js"]