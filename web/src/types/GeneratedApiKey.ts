import { objectType } from '@nexus/schema'

export const GeneratedApiKey = objectType({
  name: 'GeneratedApiKey',
  definition(t) {
    t.string('key')
    t.string('prefix')
  },
})
