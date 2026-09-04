FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY certs ./certs  


COPY . .


RUN npx prisma generate


EXPOSE 4000

CMD ["node", "src/server.js"]