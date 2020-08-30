import { PrismaClient } from '@prisma/client'
require('dotenv').config()
const crypto = require('crypto')
const logger = require('pino')()

const prisma = new PrismaClient()

export const getUser = async (apiKey: String | undefined) => {
  const hashed = crypto.createHash('sha256').update(apiKey).digest('hex')
  const apiKeyRecord = await prisma.apiKey.findOne({
    where: {
      hashed,
    },
    include: { user: true },
  })

  return apiKeyRecord?.user
}
