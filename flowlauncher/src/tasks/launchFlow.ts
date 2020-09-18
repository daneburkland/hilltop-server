import { PrismaClient } from '@prisma/client'
export const logger = require('pino')()
import BrowserService from '../services/browser'
import { Job, DoneCallback } from 'bull'
const prisma = new PrismaClient()

const launchFlow = async (job: Job, done: DoneCallback) => {
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

    await prisma.$disconnect()
    done(null, result)
  } catch (e) {
    await prisma.$disconnect()
    logger.error(e)
  }
}

export default launchFlow
