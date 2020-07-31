import { intArg, mutationType, stringArg, booleanArg } from '@nexus/schema'
import { getUser } from '../utils'
import { createFlowMutation } from './api/Mutation'
const Queue = require('bull')
const logger = require('pino')()
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)
const mailerQueue = new Queue('mailerQueue', process.env.REDIS_URL)
const crypto = require('crypto')
const fetch = require('node-fetch')

const generateApiKeyMutation = (t: any) => {
  t.field('generateApiKey', {
    type: 'GeneratedApiKey',
    resolve: async (_parent, _, ctx) => {
      const { id } = await getUser(ctx)
      if (!id) throw new Error('Count not authenticate user.')

      const key = crypto.randomBytes(32).toString('hex')
      const hashed = crypto.createHash('sha256').update(key).digest('hex')
      const prefix = crypto.randomBytes(2).toString('hex')
      try {
        const apiKey = await ctx.prisma.apiKey.upsert({
          where: { userId: id },
          update: {
            hashed,
            prefix,
          },
          create: {
            hashed,
            prefix,
            user: { connect: { id } },
          },
        })

        return { ...apiKey, key }
      } catch (e) {
        logger.error(`Failed to generate API key: ${e}`)
      }
    },
  })
}

const loginMutation = (t) => {
  t.field('login', {
    type: 'User',
    args: {
      email: stringArg({ nullable: false }),
      name: stringArg({ nullable: false }),
    },
    resolve: async (_parent, { email, name }, ctx) => {
      const userData = await getUser(ctx)
      const { id } = userData
      const user = await ctx.prisma.user.upsert({
        where: { id: id },
        create: {
          id,
          name,
          email,
        },
        update: {
          name,
          email,
        },
      })
      return user
    },
  })
}

const inviteTeammateMutation = (t) => {
  t.field('inviteTeammate', {
    type: 'User',
    args: {
      email: stringArg({ nullable: false }),
    },
    resolve: async (_parent, { email }, ctx) => {
      const userData = await getUser(ctx)
      const { id } = userData

      const inviter = await ctx.prisma.user.findOne({
        where: {
          id,
        },
      })

      const auth0Token = await fetch(
        'https://dev-m01wp096.auth0.com/oauth/token',
        {
          method: 'post',
          headers: { 'content-type': 'application/json' },
          body: `{"client_id":"${process.env.AUTH0_CLIENT_ID}","client_secret":"${process.env.AUTH0_CLIENT_SECRET}","audience":"https://${process.env.AUTH0_DOMAIN}/api/v2/","grant_type":"client_credentials"}`,
        },
      )

      const token = await auth0Token.json()

      const auth0Response = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
        {
          method: 'post',
          body: JSON.stringify({
            email,
            password: 'initialPassword#1',
            connection: 'Username-Password-Authentication',
            verify_email: false,
            email_verified: false,
          }),
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      )

      const auth0User = await auth0Response.json()

      const user = await ctx.prisma.user.create({
        data: {
          email,
          id: auth0User.user_id,
          team: { connect: { id: inviter.teamId } },
        },
      })

      const auth0PasswordResponse = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`,
        {
          method: 'post',
          body: JSON.stringify({
            user_id: auth0User.user_id,
            includeEmailInRedirect: true,
          }),
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      )

      const auth0PasswordLink = await auth0PasswordResponse.json()

      mailerQueue.add({ email, url: auth0PasswordLink.ticket })

      return user
    },
  })
}

const updateFlowMutation = (t) => {
  t.field('updateFlow', {
    type: 'Flow',
    args: {
      title: stringArg({ nullable: false }),
      code: stringArg({ nullable: false }),
      run: booleanArg(),
      id: intArg({ nullable: false }),
    },
    resolve: async (parent, { title, code, run, id }, ctx) => {
      const flow = await ctx.prisma.flow.update({
        where: { id },
        data: {
          title,
          code,
          updatedAt: new Date(),
          runs: {
            create: [{ result: '', code }],
          },
        },
        include: {
          runs: {
            take: -1,
          },
        },
      })

      try {
        if (run) {
          flowQueue.add({ id: flow.runs[0].id, code: flow.code })
        }
      } catch (e) {
        logger.error(e)
      }

      return flow
    },
  })
}

export const Mutation = mutationType({
  definition(t) {
    loginMutation(t)
    generateApiKeyMutation(t)
    createFlowMutation(t)
    updateFlowMutation(t)
    inviteTeammateMutation(t)
  },
})
