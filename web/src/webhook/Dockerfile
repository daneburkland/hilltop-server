FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./
# COPY prisma/schema* ./prisma/

COPY . .

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

RUN yarn build

COPY ./dist .

# Bundle app source

# RUN yarn flowLauncher

EXPOSE 8000

CMD [ "node", "dist/webhook/server" ]