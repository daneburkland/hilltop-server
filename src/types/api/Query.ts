import { intArg, queryType, arg, inputObjectType } from '@nexus/schema'
import { getUser } from '../../utils'

const FlowOrderByInput = inputObjectType({
  name: 'FlowOrderByInput',
  definition(t) {
    t.string('updatedAt', { nullable: true })
  },
})

const FlowRunOrderByInput = inputObjectType({
  name: 'FlowRunOrderByInput',
  definition(t) {
    t.string('createdAt', { nullable: true })
  },
})

export const myFlowQuery = (t) => {
  t.list.field('myFlows', {
    type: 'Flow',
    args: {
      // This is fucked, why can't I use the generated type
      orderBy: arg({ type: FlowOrderByInput as any }),
    },
    resolve: async (parent, args, ctx) => {
      const { sub: id } = await getUser(ctx)
      return ctx.prisma.flow.findMany({
        where: { authorId: id },
        include: { author: true },
        orderBy: args.orderBy,
      })
    },
  })
}

export const flowQuery = (t) => {
  t.field('flow', {
    type: 'Flow',
    args: {
      id: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.flow.findOne({
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

export const flowRunQuery = (t) => {
  t.field('flowRun', {
    type: 'FlowRun',
    args: {
      id: intArg({ nullable: true }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.flowRun.findOne({
        where: { id: args.id },
        include: {
          flow: true,
        },
      })
    },
  })
}

export const flowRunsQuery = (t) => {
  t.list.field('flowRuns', {
    type: 'FlowRun',
    args: {
      id: intArg({ nullable: true }),
      orderBy: arg({ type: FlowRunOrderByInput as any }),
    },
    resolve: async (parent, args, ctx) => {
      return ctx.prisma.flowRun.findMany({
        where: { flowId: args.id },
        orderBy: args.orderBy,
      })
    },
  })
}

export const Query = queryType({
  definition(t) {
    myFlowQuery(t)
    flowQuery(t)
    flowRunQuery(t)
    flowRunsQuery(t)
  },
})
