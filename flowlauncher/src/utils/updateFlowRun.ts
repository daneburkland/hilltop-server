import { Client } from 'pg'
const format = require('pg-format')
const parentLogger = require('pino')()
import { JobResult } from '../types'

export default async function updateFlowRun(result: JobResult, id: number) {
  const logger = parentLogger.child({ runId: id })
  logger.info(`result: ${JSON.stringify(result)}`)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
  })

  try {
    await client.connect()

    await client.query(
      format(
        `INSERT INTO "Log"(level, "runId", msg) VALUES %L returning id`,
        result.logs,
      ),
    )

    await client.query(
      `UPDATE "FlowRun" SET result = ($1), "screenshotUrls" = ($2), "error" = ($3) WHERE id=($4)`,
      [JSON.stringify(result.result), result.screenshotUrls, result.error, id],
    )
    await client.end()
    logger.info(`Updated flowRun successfully`)
  } catch (e) {
    logger.error(e)
  }
}
