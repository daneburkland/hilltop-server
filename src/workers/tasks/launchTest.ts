const fs = require('fs')
export const logger = require('pino')()
const Docker = require('dockerode')
const stream = require('stream')

import { Job, DoneCallback } from 'bull'
import { Container } from 'dockerode'

const dockerode = new Docker()

function containerLogs(container: Container, dir: String, done: any) {
  // create a single stream for stdin and stdout
  var logStream = new stream.PassThrough()
  logStream.on('data', function (chunk: any) {
    const log = chunk.toString('utf8')
    // CHeck to see if chunk.result?
    try {
      const parsed = JSON.parse(log)
      console.log('parsed', parsed)
      if (parsed.result) {
        container.stop().then(() => {
          container.remove().then(() => {
            logger.info('Succesfully removed container')
            fs.rmdirSync(dir, { recursive: true })
            logger.info('Successfully deleted working directory')
            done(null, parsed.result)
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

      // setTimeout(function () {
      //   stream.destroy()
      // }, 2000)
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
            containerLogs(container, dir, done)
          })
        },
      )
    },
  )
}

export default run
