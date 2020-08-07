import { objectType } from '@nexus/schema'

export const Webhook = objectType({
  name: 'Webhook',
  definition(t) {
    t.model.id()
    t.model.resource()
    t.model.onCreate()
    t.model.onExecute()
    t.model.url()
  },
})
