import request from 'supertest'
import { app, prisma } from '../src/app'
import getPort from 'get-port'
const Queue = require('bull')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let server: any
let flowQueue: any

beforeAll(async (done) => {
  const port = await getPort()
  server = app.listen(port, () =>
    console.log(`🚀 Server ready at: http://localhost:${port}`),
  ) as any
  flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  await server.close()
  done()
})

beforeEach(async () => {
  // Start with a fresh redis db
  await exec(
    `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
  )
})

test('GET /flows: an invalid key error is returned if no x-api-key is supplied', async () => {
  const response = await request(app)
    .get('/flows')
    .set('Accept', 'application/json')
    .expect(401)

  expect(response.body).toMatchObject({
    message: 'No API key provided.',
  })
})

test("GET /flows: a user's flows are returned", async () => {
  const response = await request(app)
    .get('/flows')
    .set('Accept', 'application/json')
    .set(
      'X-API-KEY',
      'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
    )
    .expect('Content-Type', /json/)
    .expect(200)

  expect(response.body).toMatchObject([
    {
      authorId: 'blueAdmin',
      title: "Blue admin's first flow",
    },
  ])
})

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

describe('PUT /flow/:id:', () => {
  test('an error is returned if a user attempts to update a flow they dont own', async () => {
    const response = await request(app)
      .put('/flow/' + 1)
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
      .put('/flow/' + 1)
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
      .put('/flow/' + 1)
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
