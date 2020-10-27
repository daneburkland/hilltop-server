import { prisma } from '../db'
import request from 'supertest'
import { app } from '../app'
import getPort from 'get-port'
const Queue = require('bull')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let server: any
let flowQueue: any

const redisHost = 'ec2-3-85-254-196.compute-1.amazonaws.com'
const redisPort = '18429'
const redisPassword =
  'p7a9099376bc893b95cc22b57bc575e9b5ed3406f288f0507f5620603543ca5cf'

beforeAll(async (done) => {
  const port = await getPort()
  server = app.listen(port) as any
  flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  await server.close()
  flowQueue.close()
  done()
})

let seededFlow: any
beforeEach(async () => {
  // Start with a fresh redis db
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
})

afterEach(async () => {
  const flow = await prisma.flow.findOne({
    where: {
      id: seededFlow.id,
    },
    include: {
      repeatOptions: true,
    },
  })
  if (flow?.repeatOptions) {
    await prisma.repeatOptions.delete({
      where: {
        id: flow.repeatOptions?.id,
      },
    })
  }
  await prisma.flow.delete({
    where: {
      id: seededFlow.id,
    },
  })
})

describe('GET /flow: ', () => {
  test('GET /flow: an invalid key error is returned if no x-api-key is supplied', async () => {
    const response = await request(app)
      .get('/flow')
      .set('Accept', 'application/json')
      .expect(401)

    expect(response.body).toMatchObject({
      message: 'No API key provided.',
    })
  })

  test("GET /flow: a user's flows are returned", async () => {
    const response = await request(app)
      .get('/flow')
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toMatchObject([
      {
        authorId: 'auth0|5f4e4f3c0e634f006d229826',
        title: 'A first flow.',
      },
    ])
  })
})

describe('POST /flow:', () => {
  test('POST /flow: a flow is created and a flowRun is added to the queue', async () => {
    const response = await request(app)
      .post('/flow')
      .send({ title: 'foo', code: 'bar' })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)

    const jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        data: { flowId: response.body.id },
      },
    ])
  })
})

describe('PUT /flow/:id:', () => {
  test('a 401 is returned if a user attempts to update a flow they dont own', async () => {
    await request(app)
      .put('/flow/' + seededFlow.id)
      .send({
        title: 'Updated title',
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })
  test('a user is able to update their own flow if their x-api-key is included', async () => {
    const response = await request(app)
      .put('/flow/' + seededFlow.id)
      .send({
        title: 'Updated title',
        repeatOptions: {
          every: 100000,
        },
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)

    let jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        opts: {
          repeat: {
            every: 100000,
          },
        },
        data: { flowId: response.body.id },
      },
    ])

    const response2 = await request(app)
      .put('/flow/' + seededFlow.id)
      .send({
        title: 'Updated again',
        repeatOptions: {
          every: 150000,
        },
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)

    jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        opts: {
          repeat: {
            every: 150000,
          },
        },
        data: { flowId: response2.body.id },
      },
    ])
  })
})

describe('DELETE /flow/:id:', () => {
  let newFlow: any
  let repeatOptions: any
  let run: any

  beforeEach(async () => {
    newFlow = await prisma.flow.create({
      data: {
        title: 'to be deleted',
        code: 'some code',
        author: {
          connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
        },
      },
    })

    const repeat = { every: 150000 }
    await flowQueue.add(
      {
        flowId: newFlow.id,
      },
      { jobId: newFlow.id, repeat },
    )

    run = await prisma.flowRun.create({
      data: {
        code: 'some code',
        result: '',
        flow: {
          connect: { id: newFlow.id },
        },
      },
    })

    // Manually add the job (this happens in the /post and /put)
    // TODO: If I defaulted repeatOptions#id somehow, I could just connect above
    repeatOptions = await prisma.repeatOptions.create({
      data: {
        ...repeat,
        jobId: newFlow.id,
        flow: {
          connect: { id: newFlow.id },
        },
      },
    })

    const flow = await prisma.flow.findOne({
      where: { id: newFlow.id },
      include: { runs: true, repeatOptions: true },
    })

    expect(flow).toMatchObject({
      title: 'to be deleted',
      runs: [{ code: 'some code' }],
    })

    const jobs = await flowQueue.getJobs()
    expect(jobs).toMatchObject([
      {
        data: { flowId: flow?.id },
      },
    ])
  })

  afterEach(async () => {
    try {
      await prisma.flowRun.delete({
        where: {
          id: run.id,
        },
      })
      await prisma.repeatOptions.delete({
        where: {
          id: repeatOptions.id,
        },
      })
      await prisma.flow.delete({
        where: {
          id: newFlow.id,
        },
      })
    } catch (e) {}
  })

  test("a 401 is returned if a user attempts to delete a flow they don't own", async () => {
    await request(app)
      .delete('/flow/' + newFlow.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })

  test('a user is able to delete their flows — and connected flowRuns', async () => {
    await request(app)
      .delete('/flow/' + newFlow.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)

    const flow = await prisma.flow.findOne({
      where: { id: newFlow.id },
      include: { runs: true, repeatOptions: true },
    })
    expect(flow).toBeFalsy()

    const jobs = await flowQueue.getJobs()
    expect(jobs).toHaveLength(0)
  })
})

describe('GET /flow/:id:', () => {
  let newFlow: any
  beforeAll(async () => {
    newFlow = await prisma.flow.create({
      data: {
        title: 'to be deleted',
        code: 'some code',
        author: {
          connect: { id: 'auth0|5f4e4f3c0e634f006d229826' },
        },
        runs: {
          create: [{ code: 'some code', result: '' }],
        },
      },
    })
  })

  afterAll(async () => {
    afterEach(async () => {
      await prisma.flow.delete({
        where: {
          id: newFlow.id,
        },
      })
    })
  })

  beforeEach(async () => {
    const flow = await prisma.flow.findOne({
      where: { id: newFlow.id },
      include: { runs: true },
    })

    expect(flow).toMatchObject({
      title: 'to be deleted',
      runs: [{ code: 'some code' }],
    })
  })

  test("a 401 is returned if a user attempts to get a flow they don't own", async () => {
    await request(app)
      .get('/flow/' + newFlow.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })

  test('a user is able to get their flows — and connected flowRuns', async () => {
    await request(app)
      .get('/flow/' + newFlow.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)
  })
})
