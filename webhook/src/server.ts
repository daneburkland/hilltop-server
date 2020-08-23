const Queue = require('bull')
import { Job } from 'bull'
const logger = require('pino')()
import pingWebhook from './pingWebhook'

let webhookQueue
try {
  webhookQueue = new Queue('webhookQueue', process.env.REDIS_URL)
} catch (e) {
  logger.error(e)
}

try {
  logger.info('processing webhook')
  webhookQueue.process(pingWebhook)
} catch (e) {
  logger.error(`Failed to process flow run: ${e}`)
}
webhookQueue.on('completed', async (job: Job, { result }: { result: any }) => {
  logger.info('Removing webhook job')
  job.remove()
})
