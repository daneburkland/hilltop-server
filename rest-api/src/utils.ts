import { prisma } from './db'
require('dotenv').config()
const crypto = require('crypto')

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
