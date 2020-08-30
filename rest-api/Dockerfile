FROM node:12

ADD ./rest-api/package.json /tmp/package.json
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

COPY ./rest-api/ .
COPY ./web/prisma/ ./prisma/
# If you are building your code for production
# RUN npm ci --only=production

RUN yarn build

EXPOSE 7000
CMD [ "node", "dist/server" ]