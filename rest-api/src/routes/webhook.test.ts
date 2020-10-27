import { prisma } from '../db'
import request from 'supertest'
import { app } from '../app'
import getPort from 'get-port'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let server: any

beforeAll(async (done) => {
  const port = await getPort()
  server = app.listen(port) as any

  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  await server.close()
  done()
})

beforeEach(async () => {
  // Start with a fresh redis db
})

describe('GET /webhook: ', () => {
  let webhook: any
  beforeAll(async () => {
    webhook = await prisma.webhook.create({
      data: {
        event: {
          connect: {
            noun_verb: {
              noun: 'Flow',
              verb: 'executed',
            },
          },
        },
        url: 'test.com',
        owner: {
          connect: {
            id: 'auth0|5f4e4f3c0e634f006d229826',
          },
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.webhook.delete({
      where: { id: webhook.id },
    })
  })

  test('GET /webhook: an invalid key error is returned if no x-api-key is supplied', async () => {
    const response = await request(app)
      .get('/webhook')
      .set('Accept', 'application/json')
      .expect(401)

    expect(response.body).toMatchObject({
      message: 'No API key provided.',
    })
  })

  test("GET /webhook: a user's webhooks are returned", async () => {
    const response = await request(app)
      .get('/webhook')
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toMatchObject([
      {
        eventNoun: 'Flow',
        eventVerb: 'executed',
        ownerId: 'auth0|5f4e4f3c0e634f006d229826',
      },
    ])
  })
})

describe('POST /webhook:', () => {
  test('a 401 is returned if a valid x-api-key is not supplied', async () => {
    await request(app)
      .post('/webhook')
      .send({ url: 'somesite.com', noun: 'Flow', verb: 'executed' })
      .set('Accept', 'application/json')
      .expect(401)
  })

  test('a webhook is created if a valid x-api-key is supplied', async () => {
    await request(app)
      .post('/webhook')
      .send({ url: 'somesite.com', noun: 'Flow', verb: 'executed' })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)
  })

  test('a 400 is returned if an invalid noun is supplied', async () => {
    await request(app)
      .post('/webhook')
      .send({ url: 'somesite.com', noun: 'Glow', verb: 'executed' })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(400)
  })
})

describe('PUT /webhook/:id:', () => {
  let webhook: any
  beforeAll(async () => {
    webhook = await prisma.webhook.create({
      data: {
        event: {
          connect: {
            noun_verb: {
              noun: 'Flow',
              verb: 'executed',
            },
          },
        },
        url: 'test.com',
        owner: {
          connect: {
            id: 'auth0|5f4e4f3c0e634f006d229826',
          },
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.webhook.delete({
      where: { id: webhook.id },
    })
  })
  test('a 401 is returned if a user attempts to update a webhook they dont own', async () => {
    await request(app)
      .put('/webhook/' + webhook.id)
      .send({
        verb: 'errored',
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })
  test('a user is able to update their own webhook if their x-api-key is included', async () => {
    const response = await request(app)
      .put('/webhook/' + webhook.id)
      .send({
        verb: 'errored',
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)
  })
  test('a 400 is returned if invalid verb is supplied', async () => {
    await request(app)
      .put('/webhook/' + webhook.id)
      .send({
        verb: 'goofed',
      })
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(400)
  })
})

describe('DELETE /webhook/:id:', () => {
  let webhook: any
  beforeAll(async () => {
    webhook = await prisma.webhook.create({
      data: {
        event: {
          connect: {
            noun_verb: {
              noun: 'Flow',
              verb: 'executed',
            },
          },
        },
        url: 'test.com',
        owner: {
          connect: {
            id: 'auth0|5f4e4f3c0e634f006d229826',
          },
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.webhook.delete({
      where: { id: webhook.id },
    })
  })
  test('a 401 is returned if a user attempts to delete a webhook they dont own', async () => {
    await request(app)
      .delete('/webhook/' + webhook.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })
  test('a user is able to delete their own webhook if their x-api-key is included', async () => {
    const response = await request(app)
      .delete('/webhook/' + webhook.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)
  })
  test('a 400 is returned if invalid id is supplied', async () => {
    const response = await request(app)
      .delete('/webhook/' + 'goofed')
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(400)
  })
})

describe('GET /webhook/:id:', () => {
  let webhook: any
  beforeAll(async () => {
    webhook = await prisma.webhook.create({
      data: {
        event: {
          connect: {
            noun_verb: {
              noun: 'Flow',
              verb: 'executed',
            },
          },
        },
        url: 'test.com',
        owner: {
          connect: {
            id: 'auth0|5f4e4f3c0e634f006d229826',
          },
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.webhook.delete({
      where: { id: webhook.id },
    })
  })

  test("a 401 is returned if a user attempts to get a webhook they don't own", async () => {
    await request(app)
      .get('/webhook/' + webhook.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // red admin
        '9eb8f25c27304e9bcd46fd95523f27d9ed31564d2555faaf01304462ae7b728b',
      )
      .expect(401)
  })

  test('a user is able to get their webhook', async () => {
    const response = await request(app)
      .get('/webhook/' + webhook.id)
      .set('Accept', 'application/json')
      .set(
        'X-API-KEY',
        // blue admin
        'b48fa64de97e0887a86347c7ba94c78911763c0a80054d02c0f4de80042a33a3',
      )
      .expect(200)

    expect(response.body).toMatchObject({
      eventNoun: 'Flow',
      eventVerb: 'executed',
      ownerId: 'auth0|5f4e4f3c0e634f006d229826',
    })
  })
})
