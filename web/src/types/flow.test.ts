import getPort from 'get-port'
import request from 'supertest'
import { server } from '../server'
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

let port: any
let httpServer: any
beforeAll(async () => {
  port = await getPort()
  httpServer = await server.start({ port })
})
afterAll(async () => {
  await httpServer.close()
})

let seededFlow: any
beforeEach(async () => {
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
