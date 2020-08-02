import { objectType } from '@nexus/schema'

export const FlowRun = objectType({
  name: 'FlowRun',
  definition(t) {
    t.model.id()
    t.model.createdAt()
    t.model.result()
    t.model.flow()
    t.model.logs()
    t.model.screenshotUrls()
  },
})
