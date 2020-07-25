import { Context } from 'graphql-yoga/dist/types'
require('dotenv').config()
const crypto = require('crypto')
const logger = require('pino')

export const getUser = async (context: Context) => {
  const apiKey = context.request.get('X-API-KEY')

  if (apiKey) {
    try {
      const hashed = crypto.createHash('sha256').update(apiKey).digest('hex')
      const { user } = await context.prisma.apiKey.findOne({
        where: {
          hashed,
        },
        include: { user: true },
      })

      return user
    } catch (e) {
      logger.error(e)
      return e
    }
  }

  return { error: 'No token provided' }
}
