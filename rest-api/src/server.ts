import { PrismaClient } from '@prisma/client'
import * as bodyParser from 'body-parser'
import express from 'express'
import { getUser } from './utils'
const logger = require('pino')()

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

const server = app.listen(7000, () =>
  console.log(
    '🚀 Server ready at: http://localhost:7000\n⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api',
  ),
)
