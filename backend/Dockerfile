# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências primeiro para cache de camada
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copia código e gera o build
COPY tsconfig.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o necessário para rodar
COPY package*.json ./
# Copia as dependências instaladas e o cliente Prisma já gerado
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Usar node diretamente é mais leve que via npm script
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]