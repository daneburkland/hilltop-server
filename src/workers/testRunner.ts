const Queue = require('bull')
import runTest from './tasks/runTest'
import { Job } from 'bull'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const testQueue = new Queue('testQueue', process.env.REDIS_URL)
try {
  testQueue.process(runTest)
} catch (e) {
  console.error(e)
}
testQueue.on(
  'completed',
  async (job: Job, { result, logs }: { result: any; logs: Array<any> }) => {
    await prisma.testRun.update({
      where: {
        id: job.data.runs[0].id,
      },
      data: {
        result: JSON.stringify(result),
        logs: {
          set: logs,
        },
      },
    })
    job.remove()
  },
)

export default testQueue
