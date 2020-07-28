import { intArg, mutationType, stringArg, booleanArg } from '@nexus/schema'
import { getUser } from '../utils'
import { createTestMutation } from './api/Mutation'
const Queue = require('bull')
const logger = require('pino')()
const testQueue = new Queue('testQueue', process.env.REDIS_URL)
const crypto = require('crypto')

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
      const user = await ctx.prisma.user.create({
        data: {
          email,
          team: { connect: { id: inviter.teamId } },
        },
      })
      return user
    },
  })
}

const updateTestMutation = (t) => {
  t.field('updateTest', {
    type: 'Test',
    args: {
      title: stringArg({ nullable: false }),
      code: stringArg({ nullable: false }),
      run: booleanArg(),
      id: intArg({ nullable: false }),
    },
    resolve: async (parent, { title, code, run, id }, ctx) => {
      const test = await ctx.prisma.test.update({
        where: { id },
        data: {
          title,
          code,
          updatedAt: new Date(),
          runs: {
            create: [{ result: '' }],
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
          testQueue.add({ id: test.runs[0].id, code: test.code })
        }
      } catch (e) {
        console.log(e)
      }

      return test
    },
  })
}

export const Mutation = mutationType({
  definition(t) {
    loginMutation(t)
    generateApiKeyMutation(t)
    createTestMutation(t)
    updateTestMutation(t)
    inviteTeammateMutation(t)
  },
})
