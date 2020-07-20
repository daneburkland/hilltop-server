# A minimal Docker image with Node and Puppeteer
#
# Initially based upon:
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM buildkite/puppeteer:latest

RUN  apt-get update && apt-get install -y git

COPY . .

EXPOSE 4000

# Install Puppeteer under /node_modules so it's available system-wide
ADD package.json package-lock.json /
# COPY package.json ./
RUN npm install
RUN npm -s run generate

# CMD node src/workers/testLauncher > node-dev src/workers/logger
# CMD ["/bin/sh", "entrypoint.sh"]
CMD ["npm", "run", "testRunner"]
# RUN ts-node src/workers/testLauncher | ts-node-dev src/workers/logger