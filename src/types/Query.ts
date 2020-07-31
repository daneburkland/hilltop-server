import { queryType } from '@nexus/schema'
import {
  myFlowQuery,
  flowQuery,
  flowRunQuery,
  flowRunsQuery,
} from './api/Query'
import { getUser } from '../utils'

export const userQuery = (t) => {
  t.field('user', {
    type: 'User',
    resolve: async (_parent, _args, ctx) => {
      const { id } = await getUser(ctx)
      const user = await ctx.prisma.user.findOne({
        where: { id },
        include: {
          team: true,
        },
      })

      return user
    },
  })
}

export const Query = queryType({
  definition(t) {
    myFlowQuery(t)
    flowQuery(t)
    flowRunQuery(t)
    flowRunsQuery(t)
    userQuery(t)
  },
})
