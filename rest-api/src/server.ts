import { PrismaClient } from '@prisma/client'
import * as bodyParser from 'body-parser'
import express from 'express'
import { getUser } from './utils'
const logger = require('pino')()
const Queue = require('bull')
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

const prisma = new PrismaClient()
const app = express()

app.use(bodyParser.json())

app.get('/flows', async (req: any, res: any) => {
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    const flows = await prisma.flow.findMany({
      where: { authorId: user.id },
    })
    res.json(flows)
  }
})

app.post('/flow', async (req: any, res: any) => {
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    const flow = await prisma.flow.create({
      data: {
        ...req.body,
        author: {
          connect: { id: user.id },
        },
      },
    })

    await flowQueue.add({
      flowId: flow.id,
    })

    res.json(flow)
  }
})

app.put('/flow/:id', async (req: any, res: any) => {
  const { id } = req.params
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    let oldRepeatOptions
    if (req.body.repeatOptions) {
      oldRepeatOptions = await prisma.repeatOptions.findOne({
        where: { jobId: parseInt(id) },
      })
    }

    const flow = await prisma.flow.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        updatedAt: new Date(),
        repeatOptions: req.body.repeatOptions && {
          upsert: {
            create: { ...req.body.repeatOptions, jobId: parseInt(id) },
            update: req.body.repeatOptions,
          },
        },
      },
    })

    if (req.body.repeatOptions) {
      await flowQueue.add(
        {
          flowId: flow.id,
        },
        { jobId: id, repeat: req.body.repeatOptions },
      )
    }

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
        logger.info(
          `Removed repeatable job: ${JSON.stringify(oldRepeatOptions)}`,
        )
      } catch (e) {
        logger.error(e)
      }
    }

    res.json(flow)
  }
})

app.delete('/flow/:id', async (req: any, res: any) => {
  const { id } = req.params
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    const flowRuns = await prisma.flowRun.deleteMany({
      where: {
        flow: {
          id: parseInt(id),
        },
      },
    })
    const flow = await prisma.flow.delete({
      where: { id: parseInt(id) },
    })
    res.json(flow)
  }
})

app.get('/flow/:id', async (req: any, res: any) => {
  const { id } = req.params
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    const flow = await prisma.flow.findOne({
      where: { id: parseInt(id) },
    })
    res.json(flow)
  }
})

app.get('/webhooks', async (req: any, res: any) => {
  const user = await getUser(req.header('X-API-KEY'))
  if (!user) {
    res.json({ error: 'Incorrect token provided.' })
  } else {
    const webhooks = await prisma.webhook.findMany({
      where: { ownerId: user.id },
    })
    res.json(webhooks)
  }
})

// app.post('/webhook', async (req: any, res: any) => {

// })

// app.put('/webhook/:id', async (req: any, res: any) => {
//   const {id} = req.params;

// })

// app.delete('/webhook/:id', async (req: any, res: any) => {
//   const {id} = req.params;
// })

// app.get('/webhook/:id', async (req: any, res: any) => {
//   const {id} = req.params;
//   // which runs to return?
// })

const server = app.listen(7000, () =>
  console.log(
    '🚀 Server ready at: http://localhost:7000\n⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api',
  ),
)
