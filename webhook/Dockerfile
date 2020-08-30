FROM node:12

ADD ./webhook/package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY ./webhook/ .
COPY ./web/prisma/ ./prisma/

RUN yarn build

EXPOSE 8000

CMD [ "node", "dist/server" ]