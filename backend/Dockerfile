# imagem base
FROM node:18-alpine

# pasta onde o app vai rodar dentro do container
WORKDIR /app

# copiar configs
COPY package*.json ./

# instalar dependências
RUN npm install

# copiar todo o restante do projeto
COPY . .

# expor a porta do backend
EXPOSE 3000

# comando para iniciar o servidor
CMD ["node", "server.js"]
