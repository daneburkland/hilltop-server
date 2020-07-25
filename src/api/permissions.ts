import { rule, shield } from 'graphql-shield'
import { getUser } from './utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const { id } = await getUser(context)

    return Boolean(id)
  }),
  isTestOwner: rule()(async (parent, { id }, context) => {
    const { id: userId } = await getUser(context)
    const author = await context.prisma.test
      .findOne({
        where: {
          id,
        },
      })
      .author()

    return userId === author.id
  }),
  isTestRunOwner: rule()(async (parent, { id }, context) => {
    const { id: userId } = await getUser(context)
    const author = await context.prisma.testRun
      .findOne({
        where: {
          id,
        },
      })
      .test()
      .author()

    return userId === author.id
  }),
}

export const permissions = shield({
  Query: {
    myTests: rules.isAuthenticatedUser,
    test: rules.isTestOwner,
    // TODO: should create a isTestRunOwner
    testRun: rules.isTestRunOwner,
  },
  Mutation: {
    createTest: rules.isAuthenticatedUser,
  },
})
