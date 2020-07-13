import { intArg, queryType, stringArg } from '@nexus/schema'
import { getUser } from '../utils'

export const Query = queryType({
  definition(t) {
    // t.field('me', {
    //   type: 'User',
    //   nullable: true,
    //   resolve: (parent, args, ctx) => {
    //     const userId = getUserId(ctx)
    //     return ctx.prisma.user.findOne({
    //       where: {
    //         id: Number(userId),
    //       },
    //     })
    //   },
    // })

    t.list.field('myTests', {
      type: 'Test',
      resolve: async (parent, args, ctx) => {
        const { sub: id } = await getUser(ctx)
        return ctx.prisma.test.findMany({
          where: { authorId: id },
        })
      },
    })

    t.field('test', {
      type: 'Test',
      args: {
        id: intArg({ nullable: true }),
      },
      resolve: async (parent, args, ctx) => {
        return ctx.prisma.test.findOne({
          where: { id: args.id },
          include: {
            runs: { take: 1, skip: 3 },
          },
        })
      },
    })

    t.field('testRun', {
      type: 'TestRun',
      args: {
        id: intArg({ nullable: true }),
      },
      resolve: async (parent, args, ctx) => {
        return ctx.prisma.testRun.findOne({
          where: { id: args.id },
        })
      },
    })

    // t.list.field('filterPosts', {
    //   type: 'Post',
    //   args: {
    //     searchString: stringArg({ nullable: true }),
    //   },
    //   resolve: (parent, { searchString }, ctx) => {
    //     return ctx.prisma.post.findMany({
    //       where: {
    //         OR: [
    //           {
    //             title: {
    //               contains: searchString,
    //             },
    //           },
    //           {
    //             content: {
    //               contains: searchString,
    //             },
    //           },
    //         ],
    //       },
    //     })
    //   },
    // })

    // t.field('post', {
    //   type: 'Post',
    //   nullable: true,
    //   args: { id: intArg() },
    //   resolve: (parent, { id }, ctx) => {
    //     return ctx.prisma.post.findOne({
    //       where: {
    //         id: Number(id),
    //       },
    //     })
    //   },
    // })
  },
})
