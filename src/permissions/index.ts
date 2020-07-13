import { rule, shield } from 'graphql-shield'
import { getUser } from '../utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const { sub } = await getUser(context)

    return Boolean(sub)
  }),
  isTestOwner: rule()(async (parent, { id }, context) => {
    const { sub: userId } = await getUser(context)
    const author = await context.prisma.test
      .findOne({
        where: {
          id,
        },
      })
      .author()

    return userId === author.id
  }),
}

export const permissions = shield({
  Query: {
    myTests: rules.isAuthenticatedUser,
    test: rules.isTestOwner,
  },
  Mutation: {
    createTest: rules.isAuthenticatedUser,
    updateTest: rules.isTestOwner,
  },
})
