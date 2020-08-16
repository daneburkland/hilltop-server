FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY ./rest-api/ .
COPY ./web/prisma/ ./prisma/

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

RUN yarn build

EXPOSE 7000

CMD [ "node", "dist/server" ]