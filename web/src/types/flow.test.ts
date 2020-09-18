import getPort from 'get-port'
import request from 'supertest'
import { server } from '../server'
const Queue = require('bull')
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let port: any
let httpServer: any
let flowQueue: any

const redisHost = 'ec2-54-86-250-147.compute-1.amazonaws.com'
const redisPort = '17229'
const redisPassword =
  'p9a6aeb7b27fc1ec357db9b942fda4bf5c982eccbbbfbc3d24b608937bce28aa9'

beforeAll(async (done) => {
  port = await getPort()
  httpServer = await server.start({ port })
  flowQueue = new Queue('flowQueue', process.env.REDIS_URL)
  console.log(process.env.REDIS_URL)

  done()
})
afterAll(async (done) => {
  await httpServer.close()
  done()
})

let seededFlow: any
let seededRepeatFlow: any
beforeEach(async () => {
  await exec(
    `yarn rdcli -a ${redisPassword} -h ${redisHost} -p ${redisPort} FLUSHDB`,
  )

  seededFlow = await prisma.flow.create({
    data: {
      title: 'A first flow.',
      code: 'some code',
      author: {
        connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
      },
    },
  })

  const repeat = { every: 150000 }
  await flowQueue.add(
    {
      flowId: seededFlow.id,
    },
    { jobId: seededFlow.id, repeat },
  )

  seededRepeatFlow = await prisma.repeatOptions.create({
    data: {
      ...repeat,
      jobId: seededFlow.id,
      flow: {
        connect: {
          id: seededFlow.id,
        },
      },
    },
  })
})

afterEach(async () => {
  await prisma.repeatOptions.delete({
    where: {
      id: seededRepeatFlow.id,
    },
  })
  await prisma.flow.delete({
    where: {
      id: seededFlow.id,
    },
  })
})

it('myFlows returns a 401 if no api key is provided', async () => {
  const response = await request(httpServer)
    .post('?')
    .send({
      query: `query myFlows {
      myFlows(orderBy: { updatedAt: "desc" }) {
        id
        title
      }
    }`,
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(response.body).toMatchObject({
    errors: [
      {
        message: 'Not Authorised!',
      },
    ],
  })
})

it('myFlows returns all flows belonging to a user', async () => {
  const response = await request(httpServer)
    .post('?')
    .send({
      query: `query myFlows {
      myFlows(orderBy: { updatedAt: "desc" }) {
        id
        title
      }
    }`,
    })
    .set('authorization', `Bearer ${process.env.AUTH0_ACCESS_TOKEN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  expect(response.body).toMatchObject({
    data: {
      myFlows: [
        {
          title: 'A first flow.',
        },
      ],
    },
  })
})

describe('updateFlowOptions', () => {
  beforeAll(async () => {
    const jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        opts: {
          repeat: {
            every: 150000,
          },
        },
        data: { flowId: seededFlow.id },
      },
    ])
  })

  let response: any
  beforeEach(async () => {
    response = await request(httpServer)
      .post('?')
      .send({
        query: `mutation updateFlowOptions {
        updateFlowOptions(repeatOptions: { every: 100000 }, id: ${seededFlow.id}) {
          id
          repeatOptions {
            every
            jobId
          }
        }
      }`,
      })
      .set('authorization', `Bearer ${process.env.AUTH0_ACCESS_TOKEN}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
  })
  it('should return the updated flow and should update the queued flow', async () => {
    expect(response.body).toMatchObject({
      data: {
        updateFlowOptions: {
          repeatOptions: {
            every: 100000,
          },
        },
      },
    })

    const jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        opts: {
          repeat: {
            every: 100000,
          },
        },
        data: { flowId: seededFlow.id },
      },
    ])
  })
})
