const path = require('path')
const fs = require('fs')
export const logger = require('pino')()
import BrowserService from '../services/browser'
import { Job, DoneCallback } from 'bull'

const run = async (job: Job, done: DoneCallback) => {
  try {
    const result = await BrowserService.run(job.data)
    done(null, result)
  } catch (e) {
    done(e)
  }
}

export default run
