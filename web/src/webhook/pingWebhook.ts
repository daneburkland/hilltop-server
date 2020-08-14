import { Job, DoneCallback } from 'bull'
import { promises } from 'dns'
const { PrismaClient } = require('@prisma/client')
const logger = require('pino')()
const fetch = require('node-fetch')
type Verb = 'created' | 'executed'
type Noun = 'Flow'

const prisma = new PrismaClient()

interface JobData {
  noun: Noun
  verb: Verb
  ownerId: string
  result: any
  screenshotUrls: Array<string>
  logs: Array<number>
  id: number
  code: String
}

export default async (job: Job, done: DoneCallback) => {
  const { data }: { data: JobData } = job
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        owner: {
          id: data.ownerId,
        },
        event: {
          noun: 'Flow',
          verb: 'executed',
        },
      },
    })
    logger.info(`Found ${webhooks.length} webhooks to ping`)

    const responses = await Promise.all(
      webhooks.map(async (webhook: any) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
          })
          return response.json()
        } catch (e) {
          return Promise.resolve(e)
        }
      }),
    )

    logger.info(responses)

    done(null, 'success')
  } catch (e) {
    logger.error(e)
    done(e)
  }
}
