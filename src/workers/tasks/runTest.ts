import BrowserService from '../../services/browser'
export const logger = require('pino')()

import { Job, DoneCallback } from 'bull'

const run = async (job: Job, done: DoneCallback) => {
  const result = await BrowserService.run(job.data)

  done(null, result)
}

export default run
