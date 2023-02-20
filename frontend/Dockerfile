FROM node:18.14.1-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 8080

CMD ["yarn", "start"]
