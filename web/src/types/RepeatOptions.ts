import { objectType, inputObjectType } from '@nexus/schema'

export const RepeatOptions = objectType({
  name: 'RepeatOptions',
  definition(t) {
    t.model.id()
    t.model.jobId()
    t.model.cron()
    t.model.tz()
    t.model.limit()
    t.model.every()
    t.model.flow()
  },
})

export const RepeatOptionsInput = inputObjectType({
  name: 'RepeatOptionsInput',
  definition(t) {
    t.int('every')
  },
})
