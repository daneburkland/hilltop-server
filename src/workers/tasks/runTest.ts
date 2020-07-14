import BrowserService from '../../services/browser'
const logger = require('pino')()

import { Job, DoneCallback } from 'bull'

const run = async (job: Job, done: DoneCallback) => {
  logger.info(`Test run job processed: ${job.data.id}`)
  const result = await BrowserService.run(job.data)

  done(null, result)
}

export default run
