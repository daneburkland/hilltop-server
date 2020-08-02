# A minimal Docker image with Node and Puppeteer
#
# Initially based upon:
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM buildkite/puppeteer:latest

RUN  apt-get update && apt-get install -y git

COPY . .

EXPOSE 4000

# Install Puppeteer under /node_modules so it's available system-wide
ADD package.json /
RUN npm install

CMD ["npm", "run", "flowRunner"]