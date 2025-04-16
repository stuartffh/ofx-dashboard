# Etapa 1: build do projeto
FROM node:22.14.0-alpine AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais primeiro para melhor cache
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera os arquivos do build
RUN npm run build

# Etapa 2: imagem final de produção
FROM node:22.14.0-alpine

# Define diretório final
WORKDIR /app

# Copia apenas o necessário do build anterior
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Exposição da porta padrão do Next.js
EXPOSE 3000

# Inicia o servidor
CMD ["npm", "start"]
