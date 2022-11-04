FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src .

EXPOSE 8080
CMD [ "node", "server.js" ]