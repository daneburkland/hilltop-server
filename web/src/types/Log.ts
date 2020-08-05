import { objectType } from '@nexus/schema'

export const Log = objectType({
  name: 'Log',
  definition(t) {
    t.model.id()
    t.model.run()
    t.model.level()
    t.model.msg()
    t.model.stack()
  },
})
