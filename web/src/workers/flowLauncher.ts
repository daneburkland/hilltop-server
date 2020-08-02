require('dotenv').config()
import * as path from 'path'
const Queue = require('bull')
import launchFlow from './tasks/launchFlow'
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
        context: path.join(__dirname, '../flowRunner'),
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

const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

try {
  flowQueue.process(launchFlow)
} catch (e) {
  logger.error(`Failed to process flow run: ${e}`)
}
flowQueue.on(
  'completed',
  async (
    job: Job,
    { result, screenshotUrls }: { result: any; screenshotUrls: Array<string> },
  ) => {
    await prisma.flowRun.update({
      where: {
        id: job.data.id,
      },
      data: {
        result: JSON.stringify(result),
        screenshotUrls: {
          set: screenshotUrls,
        },
      },
    })
    job.remove()
  },
)

export default flowQueue
