FROM buildkite/puppeteer:latest

RUN  apt-get update && apt-get install -y git

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

EXPOSE 5000
CMD [ "node", "dist/index" ]