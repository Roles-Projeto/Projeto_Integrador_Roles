FROM node:18

# Diretório base
WORKDIR /app

# Copia só package.json do backend (melhor cache)
COPY backend/package*.json ./backend/

# Instala dependências do backend
WORKDIR /app/backend
RUN npm install

# Copia o resto do projeto
WORKDIR /app
COPY . .

# Volta pro backend pra rodar
WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]