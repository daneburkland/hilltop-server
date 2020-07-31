import { rule, shield } from 'graphql-shield'
import { getUser } from './utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const { id } = await getUser(context)

    return Boolean(id)
  }),
  isFlowOwner: rule()(async (parent, { id }, context) => {
    const { id: userId } = await getUser(context)
    const author = await context.prisma.flow
      .findOne({
        where: {
          id,
        },
      })
      .author()

    return userId === author.id
  }),
  isFlowRunOwner: rule()(async (parent, { id }, context) => {
    const { id: userId } = await getUser(context)
    const author = await context.prisma.flowRun
      .findOne({
        where: {
          id,
        },
      })
      .flow()
      .author()

    return userId === author.id
  }),
}

export const permissions = shield({
  Query: {
    myFlows: rules.isAuthenticatedUser,
    flow: rules.isFlowOwner,
    // TODO: should create a isFlowRunOwner
    flowRun: rules.isFlowRunOwner,
  },
  Mutation: {
    createFlow: rules.isAuthenticatedUser,
  },
})
