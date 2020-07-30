import { intArg, queryType, arg, inputObjectType } from '@nexus/schema'
import { getUser } from '../../utils'

const TestOrderByInput = inputObjectType({
  name: 'TestOrderByInput',
  definition(t) {
    t.string('updatedAt', { nullable: true })
  },
})

const TestRunOrderByInput = inputObjectType({
  name: 'TestRunOrderByInput',
  definition(t) {
    t.string('createdAt', { nullable: true })
  },
})

export const myTestQuery = (t) => {
  t.list.field('myTests', {
    type: 'Test',
    args: {
      // This is fucked, why can't I use the generated type
      orderBy: arg({ type: TestOrderByInput as any }),
    },
    resolve: async (parent, args, ctx) => {
      const { sub: id } = await getUser(ctx)
      return ctx.prisma.test.findMany({
        where: { authorId: id },
        include: { author: true },
        orderBy: args.orderBy,
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
          author: {
            include: {
              team: true,
            },
          },
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
        include: {
          test: true,
        },
      })
    },
  })
}

export const testRunsQuery = (t) => {
  t.list.field('testRuns', {
    type: 'TestRun',
    args: {
      id: intArg({ nullable: true }),
      orderBy: arg({ type: TestRunOrderByInput as any }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.testRun.findMany({
        where: { testId: args.id },
        orderBy: args.orderBy,
      })
    },
  })
}

export const Query = queryType({
  definition(t) {
    myTestQuery(t)
    testQuery(t)
    testRunQuery(t)
    testRunsQuery(t)
  },
})
