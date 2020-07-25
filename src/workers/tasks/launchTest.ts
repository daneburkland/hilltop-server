const path = require('path')
const fs = require('fs')
export const logger = require('pino')()
const Docker = require('dockerode')
const stream = require('stream')
const AWS = require('aws-sdk')

import { Job, DoneCallback } from 'bull'
import { Container } from 'dockerode'

const dockerode = new Docker()

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

async function uploadScreenshots(dir: any, testRunId: string) {
  const screenshotUrls = await Promise.all(
    fs
      .readdirSync(dir)
      .filter((file) =>
        ['.png', '.jpg'].includes(path.extname(file).toLowerCase()),
      )
      .map(async (file) => {
        const data = await fs.readFileSync(`${dir}/${file}`)
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: `${testRunId}/${file}`,
          Body: data,
        }
        return new Promise(function (resolve, reject) {
          s3.upload(params, function (err, data) {
            if (err) {
              reject(err)
            } else {
              logger.info(`Uploaded screenshot: ${data.Location}`)
              resolve(data.Location)
            }
          })
        })
      }),
  )

  return screenshotUrls
}

function containerLogs({
  container,
  dir,
  done,
  testRunId,
}: {
  container: Container
  dir: string
  done: any
  testRunId: string
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
              screenshotUrls = await uploadScreenshots(dir, testRunId)
            } catch (e) {
              logger.error(`Failed to upload screenshots: ${e}`)
            }
            logger.info('Succesfully removed container')
            fs.rmdirSync(dir, { recursive: true })
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
      stream.on('end', function () {
        logStream.end('!stop!')
      })
    },
  )
}

const run = async (job: Job, done: DoneCallback) => {
  // check to see if the folder exists
  const dir = `testRun-${job.data.id}`
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
            Source: `/Users/daneburkland/Code/hilltop-server/${dir}/`,
            Type: 'bind',
          },
        ],
      },
    },
    function (err: any, container: Container) {
      console.error(err)
      container.attach(
        {
          stream: true,
          stdout: true,
          stderr: true,
          tty: true,
        },
        function (err, stream) {
          console.error(err)
          stream.pipe(process.stdout)

          container.start({}, function (err, data) {
            console.error(err)
            containerLogs({ container, dir, done, testRunId: job.data.id })
          })
        },
      )
    },
  )
}

export default run
