import { objectType } from '@nexus/schema'

export const ApiKey = objectType({
  name: 'ApiKey',
  definition(t) {
    t.model.hashed()
    t.model.prefix()
    t.model.userId()
  },
})
