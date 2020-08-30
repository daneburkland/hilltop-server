FROM node:12

ADD ./package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY . .

RUN yarn build


EXPOSE 4000

CMD [ "node", "dist/server" ]