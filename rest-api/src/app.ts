import { PrismaClient } from '@prisma/client'
import * as bodyParser from 'body-parser'
import express, { Request, Response, NextFunction } from 'express'
const createError = require('http-errors')
import { getUser } from './utils'
const flow = require('./routes/flow')
const webhook = require('./routes/webhook')

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

app.use(validateUser)

app.use('/flow', flow)
app.use('/webhook', webhook)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500)
  res.json({
    status: error.status,
    message: error.message,
    stack: error.stack,
  })
})
