import { objectType } from '@nexus/schema'

export const Webhook = objectType({
  name: 'Webhook',
  definition(t) {
    t.model.id()
    t.model.event()
    t.model.owner()
    t.model.url()
  },
})
