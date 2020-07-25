require('dotenv').config()
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')
const crypto = require('crypto')
const logger = require('pino')

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (error, key) {
    const signingKey = key.publicKey || key.rsaPublicKey
    callback(null, signingKey)
  })
}

const mungeGithubUser = (user) => ({ ...user, id: user.sub })

async function getUser(context) {
  const Authorization = context.request.get('Authorization')
  const apiKey = context.request.get('X-API-KEY')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    if (token) {
      const result = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            audience: process.env.API_IDENTIFIER,
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
          },
          (error, decoded) => {
            if (error) {
              resolve({ error })
            }
            if (decoded) {
              resolve(decoded)
            }
          },
        )
      })

      return mungeGithubUser(result)
    }
  }

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

module.exports = {
  getUser,
}
