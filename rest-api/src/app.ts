import { PrismaClient } from '@prisma/client'
import * as bodyParser from 'body-parser'
import express, { Request, Response, NextFunction } from 'express'
const createError = require('http-errors')
import { getUser } from './utils'
const logger = require('pino')()
const Queue = require('bull')
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

export const prisma = new PrismaClient()
export const app = express()

app.use(bodyParser.json())

async function validateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.header('X-API-KEY')) {
    next(createError(401, 'No API key provided.'))
    return
  }
  const user = await getUser(req.header('X-API-KEY'))
  req.user = user
  next()
}

async function validateResourceOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params

  try {
    const flow = await prisma.flow.findOne({
      where: {
        id: parseInt(id),
      },
      include: { author: true },
    })

    if (!flow || flow.author.id !== req.user.id) {
      next(createError(401, 'Unauthorized.'))
      return
    }
  } catch (e) {
    next(createError(401, 'Unauthorized.'))
    return
  }
  next()
}

app.use(validateUser)
app.use('/flow/:id', validateResourceOwnership)

app.get('/flows', async (req: Request, res: Response) => {
  const flows = await prisma.flow.findMany({
    where: {
      // weirdly, if `user.id` is undefined, this will return
      // ALL flows...
      authorId: req.user.id,
    },
  })
  res.json(flows)
})

app.post('/flow', async (req: any, res: any) => {
  const flow = await prisma.flow.create({
    data: {
      ...req.body,
      author: {
        connect: { id: req.user.id },
      },
    },
  })

  await flowQueue.add({
    flowId: flow.id,
  })

  res.json(flow)
})

app.put('/flow/:id', async (req: any, res: any) => {
  const { id } = req.params
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
      logger.info(`Removed repeatable job: ${JSON.stringify(oldRepeatOptions)}`)
    } catch (e) {
      logger.error(e)
    }
  }

  res.json(flow)
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

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500)
  res.json({
    status: error.status,
    message: error.message,
    stack: error.stack,
  })
})
