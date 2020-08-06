import { GraphQLServer } from 'graphql-yoga'
import { permissions } from './permissions'
import { schema } from './schema'
import { createContext } from '../context'

new GraphQLServer({
  schema,
  context: createContext,
  middlewares: [permissions],
}).start({ port: 7777 }, ({ port }) =>
  console.log(
    `🚀 Server ready at: http://localhost:${port}\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api`,
  ),
)
