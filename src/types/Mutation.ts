import { intArg, mutationType, stringArg, booleanArg } from '@nexus/schema'
import { getUser } from '../utils'
import testQueue from '../workers/testRunner'

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
        const { sub: id } = userData
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

    t.field('createTest', {
      type: 'Test',
      args: {
        title: stringArg({ nullable: false }),
        code: stringArg({ nullable: false }),
      },
      resolve: async (parent, { title, code }, ctx) => {
        const { sub: id } = await getUser(ctx)
        if (!id) throw new Error('Could not authenticate user.')

        const test = await ctx.prisma.test.create({
          data: {
            title,
            code,
            author: { connect: { id } },
          },
        })

        try {
          testQueue.add(test)
        } catch (e) {
          console.log(e)
        }

        return test
      },
    })

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
            testQueue.add(test)
          }
        } catch (e) {
          console.log(e)
        }

        return test
      },
    })

    // t.field('deletePost', {
    //   type: 'Post',
    //   nullable: true,
    //   args: { id: intArg({ nullable: false }) },
    //   resolve: (parent, { id }, ctx) => {
    //     return ctx.prisma.post.delete({
    //       where: {
    //         id,
    //       },
    //     })
    //   },
    // })

    // t.field('publish', {
    //   type: 'Post',
    //   nullable: true,
    //   args: { id: intArg() },
    //   resolve: (parent, { id }, ctx) => {
    //     return ctx.prisma.post.update({
    //       where: { id },
    //       data: { published: true },
    //     })
    //   },
    // })
  },
})
