import { PrismaClient } from '@prisma/client'
const Queue = require('bull')
import updateFlowRun from './utils/updateFlowRun'
import launchFlow from './tasks/launchFlow'
import { Job } from 'bull'
import { JobResult } from './types'
const logger = require('pino')()

const prisma = new PrismaClient()

const webhookQueue = new Queue('webhookQueue', process.env.REDIS_URL)

let flowQueue
try {
  logger.info('Initializing flowQueue')
  flowQueue = new Queue('flowQueue', process.env.REDIS_URL)
  logger.info('Initialized flowQueue')
} catch (e) {
  logger.error(e)
}

try {
  flowQueue.process(launchFlow)
  logger.info('flowLauncher initialized to process jobs')
} catch (e) {
  logger.error(`Failed to process flow run: ${e}`)
}

try {
  flowQueue.on('completed', async (job: Job, jobResult: JobResult) => {
    // TODO: just use prisma here
    await prisma.flowRun.update({
      where: { id: jobResult.id },
      data: {
        result: jobResult.result,
        screenshotUrls: {
          set: jobResult.screenshotUrls,
        },
        error: jobResult.error,
        logs: {
          create: jobResult.logs,
        },
      },
    })
    logger.info(`Updated flowRun successfully`)
    // await updateFlowRun(jobResult, job.data.id)
    await webhookQueue.add({
      verb: 'executed',
      noun: 'Flow',
      ...jobResult,
      ...job.data,
    })

    if (jobResult.error) {
      await webhookQueue.add({
        verb: 'errored',
        noun: 'Flow',
        ...jobResult,
        ...job.data,
      })
    }
    job.remove()
  })
} catch (e) {
  logger.error(e)
}

export default flowQueue
