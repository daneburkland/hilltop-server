import BrowserService from '../../services/browser'

import { Job, DoneCallback } from 'bull'

const run = async (job: Job, done: DoneCallback) => {
  console.log('***here', job)
  const result = await BrowserService.run(job.data)

  done(null, result)
}

export default run
