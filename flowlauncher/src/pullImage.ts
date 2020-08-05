const fs = require('fs')
import * as path from 'path'
const logger = require('pino')()
const Docker = require('dockerode')

const auth = {
  username: '_json_key',
  password: fs.readFileSync(path.join(__dirname, './keyfile.json')).toString(),
  serverAddress: 'gcr.io',
}

const options = {
  protocol: 'http',
  host: '127.0.0.1',
  port: 2375,
}
const dockerode = new Docker(options)

function pullImage() {
  try {
    dockerode.pull(
      'gcr.io/hilltop-285223/hilltop-flowrunner',
      { authconfig: auth },
      function (err: any, stream: any) {
        dockerode.modem.followProgress(stream, onFinished, onProgress)

        function onFinished(err: any, output: any) {
          if (err) {
            logger.error(err)
          } else {
            logger.info('Pulled image')
          }
          //output is an array with output json parsed objects
          //...
        }

        function onProgress(event: any) {
          logger.info(`${event.toString()}`)
        }
      },
    )
  } catch (e) {
    logger.error(e)
  }
}

pullImage()
