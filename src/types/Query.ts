import { queryType } from '@nexus/schema'
import { myTestQuery, testQuery, testRunQuery } from './api/Query'

export const Query = queryType({
  definition(t) {
    myTestQuery(t)
    testQuery(t)
    testRunQuery(t)
  },
})
