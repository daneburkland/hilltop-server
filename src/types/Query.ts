import { queryType } from '@nexus/schema'
import {
  myTestQuery,
  testQuery,
  testRunQuery,
  testRunsQuery,
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
    myTestQuery(t)
    testQuery(t)
    testRunQuery(t)
    testRunsQuery(t)
    userQuery(t)
  },
})
