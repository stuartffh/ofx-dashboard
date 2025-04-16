# Etapa 1: build do projeto
FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./

# Removido: COPY tailwind.config.ts ./ ← opcional

RUN npm install

COPY . .

RUN npm run build

# Etapa 2: imagem final
FROM node:22.14.0-alpine

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
