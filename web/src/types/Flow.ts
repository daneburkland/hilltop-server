import { objectType } from '@nexus/schema'

export const Flow = objectType({
  name: 'Flow',

  definition(t) {
    t.model.id()
    t.model.createdAt()
    t.model.updatedAt({})
    t.model.title()
    t.model.code()
    t.model.author()
    t.model.runs({
      pagination: true,
    })
  },
})
