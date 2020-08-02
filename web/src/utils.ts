import { JwtHeader, VerifyCallback, VerifyErrors, Secret } from 'jsonwebtoken'
import { Context } from 'nexus-plugin-prisma/dist/schema/utils'

require('dotenv').config()
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

function getKey(header: JwtHeader, callback: VerifyCallback) {
  client.getSigningKey(header.kid, function (error: VerifyErrors, key: any) {
    const signingKey = key.publicKey || key.rsaPublicKey
    callback(null, signingKey)
  })
}

const mungeGithubUser = (user: any) => ({ ...user, id: user.sub })

export const getUser = async (context: Context) => {
  const Authorization = context.request.get('Authorization')
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
          (error: VerifyErrors, decoded: object) => {
            if (error) {
              resolve({ error })
            }
            if (decoded) {
              resolve(decoded)
            }
          },
        )
      })

      return mungeGithubUser({ ...(result as object), token })
    }
  }

  return { error: 'No token provided' }
}
