import { PrismaClient } from '@prisma/client'
const path = require('path')
const fs = require('fs')
export const logger = require('pino')()
import BrowserService from '../services/browser'
import { Job, DoneCallback } from 'bull'

const prisma = new PrismaClient()

const run = async (job: Job, done: DoneCallback) => {
  let flow, flowRun
  try {
    flow = await prisma.flow.findOne({
      where: {
        id: job.data.flowId,
      },
    })
  } catch (e) {
    logger.error('Failed to fetch flow details')
    done(e)
  }
  try {
    const code = flow?.code as string
    flowRun = await prisma.flowRun.create({
      data: {
        // TODO: make this optional column
        result: '',
        code,
        flow: {
          connect: { id: job.data.flowId },
        },
      },
    })
    logger.info('Successfully created flowRun')
    const result = await BrowserService.run({
      ...job.data,
      code,
      id: flowRun.id,
    })
    done(null, result)
  } catch (e) {
    logger.error(e)
  }
}

export default run
