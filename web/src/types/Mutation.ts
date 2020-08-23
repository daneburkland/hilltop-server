import { intArg, mutationType, stringArg, booleanArg, arg } from '@nexus/schema'
import { getUser } from '../utils'
import { RepeatOptions } from './RepeatOptions'
// import { createFlowMutation } from './api/Mutation'
const Queue = require('bull')
const logger = require('pino')()

const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)
const mailerQueue = new Queue('mailerQueue', process.env.REDIS_URL)
const crypto = require('crypto')
const fetch = require('node-fetch')

export const Mutation = mutationType({
  definition(t) {
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
          where: { id },
          create: {
            id,
            name,
            email,
            team: {
              create: { name: `${name}'s team` },
            },
          },
          update: {
            name,
            email,
          },
        })
        return user
      },
    })
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
    t.field('createRepeatOptions', {
      type: 'RepeatOptions',
      args: {
        jobId: intArg({ nullable: false }),
        cron: stringArg(),
        tz: stringArg(),
        limit: intArg(),
        every: intArg(),
      },
      resolve: async (_, { jobId, cron, tz, limit, every }, ctx) => {
        const { id } = await getUser(ctx)

        try {
          const repeatOptions = await ctx.prisma.repeatOptions.create({
            data: {
              jobId,
              cron,
              tz,
              limit,
              every,
            },
          })
          return repeatOptions
        } catch (e) {
          logger.error(`Failed to create repeatOptions: ${e}`)
          return e
        }
      },
    })
    t.field('createFlow', {
      type: 'Flow',
      args: {
        title: stringArg({ nullable: false }),
        code: stringArg({ nullable: false }),
      },
      resolve: async (parent, { title, code }, ctx) => {
        const { id } = await getUser(ctx)

        try {
          const flow = await ctx.prisma.flow.create({
            data: {
              title,
              code,
              author: { connect: { id } },
              runs: {
                create: [{ result: '', code }],
              },
            },
            include: {
              runs: true,
            },
          })

          try {
            await flowQueue.add({
              id: flow.runs[0].id,
              code: flow.code,
              ownerId: id,
            })
          } catch (e) {
            logger.error(e)
          }
          return flow
        } catch (e) {
          logger.error(`Failed to create flow: ${e}`)
        }
      },
    })
    t.field('updateFlow', {
      type: 'Flow',
      args: {
        title: stringArg(),
        code: stringArg(),
        run: booleanArg(),
        id: intArg({ nullable: false }),
        // TODO: this should be a separate mutation...
        repeatOptions: arg({ type: 'RepeatOptionsInput' }),
      },
      resolve: async (_, { title, code, run, id, repeatOptions = {} }, ctx) => {
        const { id: userId } = await getUser(ctx)
        const flow = await ctx.prisma.flow.update({
          where: { id },
          data: {
            title,
            code,
            updatedAt: new Date(),
            runs: run && {
              create: [{ result: '', code }],
            },
            repeatOptions: !!repeatOptions && {
              upsert: {
                create: { ...repeatOptions, jobId: id },
                update: repeatOptions,
              },
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
            const id = flow.runs[0].id
            try {
              const addedFlow = await flowQueue.add({
                id,
                code: flow.code,
                ownerId: userId,
              })
              logger.info(`addedFlow: ${JSON.stringify(addedFlow)}`)
            } catch (e) {
              logger.error(e)
            }
          }
        } catch (e) {
          logger.error(e)
        }

        return flow
      },
    })
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
            name: email,
            team: { connect: { id: inviter?.teamId } },
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
    t.field('createWebhook', {
      type: 'Webhook',
      args: {
        verb: stringArg({ nullable: false }),
        noun: stringArg({ nullable: false }),
        url: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { verb, noun, url }, ctx) => {
        const { id } = await getUser(ctx)
        if (!id) throw new Error('Count not authenticate user.')
        logger.info(id)

        try {
          const webhook = await ctx.prisma.webhook.create({
            data: {
              event: {
                connect: { noun_verb: { verb, noun } },
              },
              url,
              owner: { connect: { id } },
            },
          })

          return webhook
        } catch (e) {
          logger.error(`Failed to create webhook: ${e}`)
        }
      },
    })
    t.field('deleteWebhook', {
      type: 'Webhook',
      args: {
        id: intArg({ nullable: false }),
      },
      resolve: async (_parent, { id: webhookId }, ctx) => {
        const { id } = await getUser(ctx)
        if (!id) throw new Error('Count not authenticate user.')

        try {
          const webhook = await ctx.prisma.webhook.delete({
            where: { id: webhookId },
          })

          return webhook
        } catch (e) {
          logger.error(`Failed to delete webhook: ${e}`)
        }
      },
    })
  },
})
