import { stringArg, mutationType } from '@nexus/schema'
import { getUser } from '../../utils'

export const createTestMutation = (t) => {
  t.field('createTest', {
    type: 'Test',
    args: {
      title: stringArg({ nullable: false }),
      code: stringArg({ nullable: false }),
    },
    resolve: async (parent, { title, code }, ctx) => {
      const { id } = await getUser(ctx)
      if (!id) throw new Error('Could not authenticate user.')

      try {
        const test = await ctx.prisma.test.create({
          data: {
            title,
            code,
            author: { connect: { id } },
          },
        })

        testQueue.add(test)
        return test
      } catch (e) {
        logger.error(`Failed to create test: ${e}`)
      }
    },
  })
}

export const Mutation = mutationType({
  definition(t) {
    createTestMutation(t)
  },
})
