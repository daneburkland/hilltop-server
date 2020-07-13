import { objectType } from '@nexus/schema'

export const TestRun = objectType({
  name: 'TestRun',
  definition(t) {
    t.model.id()
    t.model.createdAt()
    t.model.result()
    t.model.test()
    t.model.logs()
  },
})
