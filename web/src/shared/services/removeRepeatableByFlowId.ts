import { prisma } from '../../db'
const logger = require('pino')()
const Queue = require('bull')
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

async function removeRepeatableByFlowId(id: number) {
  const oldRepeatOptions = await prisma.repeatOptions.findOne({
    where: { jobId: id },
  })
  if (oldRepeatOptions) {
    logger.info(
      `Will attempt to remove job with repeatOptions: ${JSON.stringify(
        oldRepeatOptions,
      )}`,
    )
    try {
      // TODO: I should just use jobId as the db id?
      delete oldRepeatOptions.id
      flowQueue.removeRepeatable(oldRepeatOptions)
      logger.info(`Removed repeatable job: ${JSON.stringify(oldRepeatOptions)}`)
    } catch (e) {
      logger.error(e)
    }
  }
}

export default removeRepeatableByFlowId
