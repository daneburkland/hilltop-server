import { intArg, queryType } from '@nexus/schema'
import { getUser } from '../../utils'

export const myTestQuery = (t) => {
  t.list.field('myTests', {
    type: 'Test',
    resolve: async (parent, args, ctx) => {
      const { sub: id } = await getUser(ctx)
      return ctx.prisma.test.findMany({
        where: { authorId: id },
      })
    },
  })
}

export const testQuery = (t) => {
  t.field('test', {
    type: 'Test',
    args: {
      id: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.test.findOne({
        where: { id: args.id },
        include: {
          // TODO: change this to true
          runs: { take: 1, skip: 3 },
        },
      })
    },
  })
}

export const testRunQuery = (t) => {
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
}

export const Query = queryType({
  definition(t) {
    myTestQuery(t)
    testQuery(t)
    testRunQuery(t)
  },
})
