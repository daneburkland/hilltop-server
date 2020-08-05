// require('dotenv').config()
const Queue = require('bull')
import updateFlowRun from './utils/updateFlowRun'
import launchFlow from './tasks/launchFlow'
import { Job } from 'bull'
import { JobResult } from './types'
const logger = require('pino')()

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
    await updateFlowRun(jobResult, job.data.id)
    job.remove()
  })
} catch (e) {
  logger.error(e)
}

export default flowQueue
