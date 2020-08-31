import { PrismaClient } from '@prisma/client'
import express, { Request, Response, NextFunction } from 'express'
const createError = require('http-errors')
const router = express.Router()

const prisma = new PrismaClient()

async function validateResourceOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    if (!parseInt(id)) {
      next(createError(400, 'Invalid webhook id.'))
    }
    const webhook = await prisma.webhook.findOne({
      where: {
        id: parseInt(id),
      },
      include: { owner: true },
    })

    if (!webhook || webhook.owner.id !== req.user.id) {
      next(createError(401, 'Unauthorized.'))
      return
    }
    req.webhook = webhook
    next()
  } catch (e) {
    next(createError(401, 'Unauthorized.'))
    return
  }
}

router.use('/:id', validateResourceOwnership)

router.get('/', async (req: Request, res: Response) => {
  const flows = await prisma.webhook.findMany({
    where: {
      ownerId: req.user.id,
    },
  })
  res.json(flows)
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { verb, noun, url } = req.body || {}
  try {
    const webhook = await prisma.webhook.create({
      data: {
        url,
        event: {
          connect: {
            noun_verb: { verb, noun },
          },
        },
        owner: {
          connect: { id: req.user.id },
        },
      },
    })
    res.json(webhook)
  } catch (e) {
    next(createError(400, e))
  }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const { verb, noun = 'Flow', url } = req.body || {}
  try {
    const webhook = await prisma.webhook.update({
      where: { id: parseInt(id) },
      data: {
        url,
        event: {
          connect: {
            noun_verb: { verb, noun },
          },
        },
      },
    })

    res.json(webhook)
  } catch (e) {
    next(createError(400, e))
  }
})

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
      const webhook = await prisma.webhook.delete({
        where: { id: parseInt(id) },
      })

      res.json(webhook)
    } catch (e) {
      next(createError(400, e))
    }
  },
)

router.get('/:id', async (req: Request, res: Response) => {
  res.json(req.webhook)
})

module.exports = router
