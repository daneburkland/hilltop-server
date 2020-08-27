import { stringArg, mutationType } from '@nexus/schema'
import { getUser } from '../../utils'
const Queue = require('bull')
const logger = require('pino')()
const flowQueue = new Queue('flowQueue', process.env.REDIS_URL)

export const Mutation = mutationType({
  definition(t) {
    t.field('createFlow', {
      type: 'Flow',
      args: {
        title: stringArg({ nullable: false }),
        code: stringArg({ nullable: false }),
      },
      resolve: async (parent, { title, code }, ctx) => {
        const { id } = await getUser(ctx)
        if (!id) throw new Error('Could not authenticate user.')

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

          const onDone = async function ({
            result,
            screenshotUrls,
          }: {
            result: any
            screenshotUrls: Array<any>
          }) {
            await ctx.prisma.flowRun.update({
              where: {
                id,
              },
              data: {
                result: JSON.stringify(result),
                screenshotUrls: {
                  set: screenshotUrls,
                },
              },
            })
          }

          flowQueue.add({
            id: flow.runs[0].id,
            code: flow.code,
            onDone,
            foo: 'bar',
          })
          return flow
        } catch (e) {
          logger.error(`Failed to create flow: ${e}`)
        }
      },
    })
  },
})