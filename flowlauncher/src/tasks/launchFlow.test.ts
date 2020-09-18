import { PrismaClient } from '@prisma/client'
const Queue = require('bull')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
// TODO: can't use this bc it accesses the hilltopdb
import { init, flowQueue as otherFlowQueue } from './processFlow'

const Redis = require('ioredis')
const client = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

const prisma = new PrismaClient()

let flowQueue: any
let seededFlow: any
let code: any
let result: any

const opts = {
  createClient: function (type: string) {
    switch (type) {
      case 'client':
        return client
      case 'subscriber':
        return subscriber
      default:
        return new Redis(process.env.REDIS_URL)
    }
  },
}

beforeAll((done) => {
  flowQueue = new Queue('flowQueue', opts)
  init(prisma)

  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  flowQueue.close()
  otherFlowQueue.close()
  done()
})

// describe('With basic code', () => {
//   beforeAll(async () => {
//     // Start with a fresh redis db
//     await exec(
//       `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
//     )
//     result = { resultKey: 'some data' }

//     code = `
//   module.exports = async function ({ page }) {
//     console.log('inside vm!!!!')
//     return { resultKey: 'some data' }
//   };
//   `

//     seededFlow = await prisma.flow.create({
//       data: {
//         title: 'A first flow.',
//         code,
//         author: {
//           connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
//         },
//       },
//     })

//     await flowQueue.add({
//       flowId: seededFlow.id,
//     })

//     const jobs = await flowQueue.getJobs()
//     expect(jobs).toMatchObject([
//       {
//         data: { flowId: seededFlow.id },
//       },
//     ])
//   })

//   test('it creates a flowRun', async (done) => {
//     setTimeout(async () => {
//       const flow = await prisma.flow.findOne({
//         where: { id: seededFlow.id },
//         include: {
//           runs: true,
//         },
//       })
//       expect(flow).toMatchObject({
//         runs: [{ code, result }],
//       })
//       done()
//     }, 5000)
//   })
// })

// describe('With code containing an undefined variable', () => {
//   beforeAll(async () => {
//     // Start with a fresh redis db
//     await exec(
//       `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
//     )
//     result = { resultKey: 'some data' }

//     code = `
//   module.exports = async function ({ page }) {
//     console.log(undefinedConcern)
//     return { resultKey: 'some data' }
//   };
//   `

//     seededFlow = await prisma.flow.create({
//       data: {
//         title: 'A first flow.',
//         code,
//         author: {
//           connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
//         },
//       },
//     })

//     await flowQueue.add({
//       flowId: seededFlow.id,
//     })

//     const jobs = await flowQueue.getJobs()
//     expect(jobs).toMatchObject([
//       {
//         data: { flowId: seededFlow.id },
//       },
//     ])
//   })

//   test('it creates a flowRun with and error', async (done) => {
//     setTimeout(async () => {
//       const flow = await prisma.flow.findOne({
//         where: { id: seededFlow.id },
//         include: {
//           runs: true,
//         },
//       })
//       expect(flow).toMatchObject({
//         runs: [{ code, error: { message: 'undefinedConcern is not defined' } }],
//       })
//       done()
//     }, 5000)
//   })
// })

describe('With a screenshot', () => {
  beforeAll(async () => {
    // Start with a fresh redis db
    // await exec(
    //   `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
    // )
    result = { resultKey: 'some data' }

    code = `
  module.exports = async function ({ page }) {
    await page.goto('https://checklyhq.com/docs')
    await page.screenshot({ path: 'first.png' })
    return { resultKey: 'some data' }
  };
  `

    seededFlow = await prisma.flow.create({
      data: {
        title: 'A first flow.',
        code,
        author: {
          connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
        },
      },
    })

    await flowQueue.add({
      flowId: seededFlow.id,
    })

    const jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        data: { flowId: seededFlow.id },
      },
    ])
  })

  test('it creates a flowRun with a screenshotUrl array', async (done) => {
    setTimeout(async () => {
      const flow = await prisma.flow.findOne({
        where: { id: seededFlow.id },
        include: {
          runs: true,
        },
      })
      expect(flow).toMatchObject({
        runs: [
          {
            code,
            result,
            screenshotUrls: [
              `https://hilltop-screenshots-test.s3.amazonaws.com/${flow?.runs[0].id}/first.png`,
            ],
          },
        ],
      })
      done()
    }, 8000)
  })
})
