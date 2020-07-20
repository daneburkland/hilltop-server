const fs = require('fs')
export const logger = require('pino')()
const Docker = require('dockerode')

import { Job, DoneCallback } from 'bull'

const dockerode = new Docker()

const run = async (job: Job, done: DoneCallback) => {
  const dir = `testRun-${job.data.id}`
  fs.mkdirSync(dir)
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
    function (err, container) {
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
            console.log('data', data.toString())
          })
        },
      )
    },
  )
}

export default run
