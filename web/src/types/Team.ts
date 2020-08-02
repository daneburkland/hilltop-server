import { objectType } from '@nexus/schema'

export const Team = objectType({
  name: 'Team',
  definition(t) {
    t.model.id()
    t.model.members()
    t.model.name()
  },
})
