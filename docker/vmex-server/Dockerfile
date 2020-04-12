FROM node:13

WORKDIR /app

COPY package.json .
COPY dist/vmetx-server.js .

RUN yarn install

EXPOSE 8085

CMD node ./vmetx-server.js
