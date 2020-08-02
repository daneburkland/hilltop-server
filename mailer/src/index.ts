require('dotenv').config()
import sendEmail from './sendEmail'
const Queue = require('bull')
import { Job } from 'bull'
const logger = require('pino')()

const mailerQueue = new Queue('mailerQueue', process.env.REDIS_URL)

try {
  mailerQueue.process(sendEmail)
} catch (e) {
  logger.error(`Failed to process flow run: ${e}`)
}
mailerQueue.on('completed', async (job: Job, { result }: { result: any }) => {
  logger.info('Successfully sent email')
  job.remove()
})
