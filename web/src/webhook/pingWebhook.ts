import { Job, DoneCallback } from 'bull'

type Events = 'created' | 'executed'

interface JobData {
  resource: 'flow'
  events: Events[]
}

const pingWebhook = async (job: Job, done: DoneCallback) => {
  const { data }: { data: JobData } = job
}
