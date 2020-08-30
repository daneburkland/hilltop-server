FROM buildkite/puppeteer:latest

RUN  apt-get update && apt-get install -y git

ADD ./flowlauncher/package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY ./flowlauncher/ .
COPY ./web/prisma/ ./prisma/

RUN yarn build

EXPOSE 5000
CMD [ "node", "dist/index" ]