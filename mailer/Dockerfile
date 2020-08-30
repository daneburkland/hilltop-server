FROM node:12

ADD ./package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY . .

RUN yarn build

# Bundle app source

EXPOSE 6666
CMD [ "node", "dist/index" ]