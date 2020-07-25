require('dotenv').config()
const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

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

  return { error: 'No token provided' }
}

module.exports = {
  getUser,
}
