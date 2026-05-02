FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY Frontend/ ./Frontend/
EXPOSE 3000
CMD ["node", "server.js"]