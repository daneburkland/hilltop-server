import { prisma } from '../db'
import express, { Request, Response, NextFunction } from 'express'
const createError = require('http-errors')
const router = express.Router()
const logger = require('pino')()
const Queue = require('bull')
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

async function validateResourceOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    if (!parseInt(id)) {
      next(createError(400, 'Invalid flow id.'))
    }
    const flow = await prisma.flow.findOne({
      where: {
        id: parseInt(id),
      },
      include: { author: true, repeatOptions: true },
    })

    if (!flow || flow.author.id !== req.user.id) {
      next(createError(401, 'Unauthorized.'))
      return
    }
    req.flow = flow
    next()
  } catch (e) {
    next(createError(401, 'Unauthorized.'))
    return
  }
}

router.use('/:id', validateResourceOwnership)

router.get('/', async (req: Request, res: Response) => {
  const flows = await prisma.flow.findMany({
    where: {
      // weirdly, if `user.id` is undefined, this will return
      // ALL flows...
      authorId: req.user.id,
    },
  })
  res.json(flows)
})

router.post('/', async (req: any, res: any) => {
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

router.put('/:id', async (req: any, res: any) => {
  const { id } = req.params

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

  if (req.flow.repeatOptions) {
    logger.info(
      `Will attempt to remove job with repeatOptions: ${JSON.stringify(
        req.flow.repeatOptions,
      )}`,
    )
    try {
      // TODO: define repeatOptions#jobId as the foreign key to Flow table
      delete req.flow.repeatOptions.id
      flowQueue.removeRepeatable(req.flow.repeatOptions)
      logger.info(
        `Removed repeatable job: ${JSON.stringify(req.flow.repeatOptions)}`,
      )
    } catch (e) {
      logger.error(e)
    }
  }

  res.json(flow)
})

router.delete('/:id', async (req: any, res: any) => {
  const { id } = req.params

  if (req.flow.repeatOptions) {
    const repeatOptions = { ...req.flow.repeatOptions }
    delete repeatOptions.id
    flowQueue.removeRepeatable(repeatOptions)
  }

  await prisma.flowRun.deleteMany({
    where: {
      flow: {
        id: parseInt(id),
      },
    },
  })
  await prisma.repeatOptions.delete({
    where: { id: req.flow.repeatOptions.id },
  })
  const flow = await prisma.flow.delete({
    where: { id: parseInt(id) },
  })

  res.json(flow)
})

router.get('/:id', async (req: any, res: any) => {
  res.json(req.flow)
})

module.exports = router
