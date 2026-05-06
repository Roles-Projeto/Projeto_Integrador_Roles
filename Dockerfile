FROM node:18

WORKDIR /app

# instala dependências do backend primeiro
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# copia resto do projeto
WORKDIR /app
COPY . .

# roda backend
WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"] 