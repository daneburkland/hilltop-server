const Queue = require('bull')
import launchFlow from './launchFlow'
import { Job } from 'bull'
import { JobResult } from '../types'
const logger = require('pino')()

const Redis = require('ioredis')
const client = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

const opts = {
  createClient: function (type: string) {
    switch (type) {
      case 'client':
        return client
      case 'subscriber':
        return subscriber
      default:
        return new Redis(process.env.REDIS_URL)
    }
  },
}

const webhookQueue = new Queue('webhookQueue', opts)

export const flowQueue = new Queue('flowQueue', opts)
export function init(prisma: any) {
  try {
    logger.info(`Initializing flowQueue ${process.env.REDIS_URL}`)
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
      await prisma.flowRun.update({
        where: { id: jobResult.id },
        data: {
          result: jobResult.result,
          screenshotUrls: {
            set: jobResult.screenshotUrls || [],
          },
          error: jobResult.error,
          logs: {
            create: jobResult.logs,
          },
        },
      })
      logger.info(`Updated flowRun successfully`)
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
}
