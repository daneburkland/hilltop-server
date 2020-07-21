require('dotenv').config()
import * as path from 'path'
const Queue = require('bull')
import launchTest from './tasks/launchTest'
import { Job } from 'bull'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const logger = require('pino')()
const Docker = require('dockerode')

// Build docker image
const dockerode = new Docker()

async function buildImage() {
  try {
    const stream = await dockerode.buildImage(
      {
        context: path.join(__dirname, '../testRunner'),
        src: ['Dockerfile'],
      },
      { t: 'worker' },
    )
    await new Promise((resolve, reject) => {
      dockerode.modem.followProgress(stream, (err: any, res: any) =>
        err ? reject(err) : resolve(res),
      )
    })
    logger.info('Built docker image')
  } catch (e) {
    logger.error(e)
  }
}

buildImage()

const testQueue = new Queue('testQueue', process.env.REDIS_URL)

try {
  testQueue.process(launchTest)
} catch (e) {
  logger.error(`Failed to process test run: ${e}`)
}
testQueue.on('completed', async (job: Job, result: any) => {
  await prisma.testRun.update({
    where: {
      id: job.data.id,
    },
    data: {
      result: JSON.stringify(result),
    },
  })
  job.remove()
})

export default testQueue
