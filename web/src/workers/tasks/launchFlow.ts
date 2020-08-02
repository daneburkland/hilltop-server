const path = require('path')
const fs = require('fs')
export const logger = require('pino')()
const Docker = require('dockerode')
const stream = require('stream')
import * as AWS from 'aws-sdk'
const del = require('del')

import { Job, DoneCallback } from 'bull'
import { Container } from 'dockerode'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

const dockerode = new Docker()

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

async function uploadScreenshots(dir: string, runId: string) {
  const screenshotUrls = await Promise.all(
    fs
      .readdirSync(dir)
      .filter((file: string) =>
        ['.png', '.jpg'].includes(path.extname(file).toLowerCase()),
      )
      .map(async (file: string) => {
        const data = await fs.readFileSync(`${dir}/${file}`)
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: `${runId}/${file}`,
          Body: data,
        }
        return new Promise(function (resolve, reject) {
          try {
            s3.upload(params as PutObjectRequest, function (err, data) {
              if (err) {
                reject(err)
              } else {
                logger.info(`Uploaded screenshot: ${data.Location}`)
                resolve(data.Location)
              }
            })
          } catch (e) {
            logger.error(e)
          }
        })
      }),
  )

  return screenshotUrls.filter(Boolean)
}

function containerLogs({
  container,
  dir,
  done,
  runId,
}: {
  container: Container
  dir: string
  done: any
  runId: string
}) {
  // create a single stream for stdin and stdout
  var logStream = new stream.PassThrough()
  logStream.on('data', function (chunk: any) {
    const log = chunk.toString('utf8')
    try {
      const parsed = JSON.parse(log)
      if (parsed.result) {
        container.stop().then(() => {
          container.remove().then(async () => {
            let screenshotUrls = [] as Array<any>
            try {
              screenshotUrls = await uploadScreenshots(dir, runId)
            } catch (e) {
              logger.error(`Failed to upload screenshots: ${e}`)
            }
            logger.info('Successfully removed container')
            await del(dir)
            logger.info('Successfully deleted working directory')
            done(null, { screenshotUrls, result: parsed.result })
          })
        })
      }
    } catch (e) {}
  })

  container.logs(
    {
      follow: true,
      stdout: true,
      stderr: true,
    },
    function (err, stream) {
      if (err) {
        return logger.error(err.message)
      }
      container.modem.demuxStream(stream, logStream, logStream)
      if (stream) {
        stream.on('end', function () {
          logStream.end('!stop!')
        })
      } else {
        logger.error('stream is not defined')
      }
    },
  )
}

const run = async (job: Job, done: DoneCallback) => {
  // check to see if the folder exists
  const dir = `run-${job.data.id}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.writeFileSync(`${dir}/job.txt`, JSON.stringify(job.data))

  dockerode.createContainer(
    {
      Image: 'worker',
      name: `worker-${job.data.id}`,
      HostConfig: {
        Mounts: [
          {
            Target: '/job',
            Source: path.join(__dirname, '../../..', dir),
            Type: 'bind',
          },
        ],
      },
    },
    function (err: any, container: Container) {
      container.attach(
        {
          stream: true,
          stdout: true,
          stderr: true,
          tty: true,
        },
        function (err, stream) {
          if (stream) {
            stream.pipe(process.stdout)
          } else {
            logger.error(`stream is not defined`)
          }

          if (err) {
            logger.error(err)
          }

          container.start({}, function (err, data) {
            if (err) {
              logger.error(err)
            }
            containerLogs({ container, dir, done, runId: job.data.id })
          })
        },
      )
    },
  )
}

export default run
