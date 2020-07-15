require('dotenv').config()
const split = require('split2')

import { pipeline, TransformCallback, Transform } from 'stream'
import { Client } from 'pg'

class PgTransport extends Transform {
  private client: Client

  constructor(client: Client) {
    super()
    this.client = client

    process.on('SIGINT', () => this._shutdown())
    process.on('SIGTERM', () => this._shutdown())
  }

  _shutdown() {
    process.exit(0)
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    const content = chunk.toString('utf-8')
    let log: any
    try {
      log = JSON.parse(content)
    } catch {
      // pass it through non-json.
      return callback(null, `${chunk}\n`)
    }
    console.log('log', log)
    this.client
      .query(
        `INSERT INTO "Log"("testRunId", level, time, pid, hostname, msg) VALUES($1, $2, $3, $4, $5, $6)`,
        [
          log.testRunId || null,
          log.level,
          new Date(parseInt(log.time)),
          log.pid,
          log.hostname,
          log.msg,
        ],
      )
      .then(
        () => {
          callback(null, `${chunk}\n`)
        },
        (err) => callback(err, null),
      )
  }
}

function transporter(client: Client) {
  const pgTransport = new PgTransport(client)
  pgTransport.on('end', () => {
    client.end()
  })
  return pgTransport

  /*return async function* (source: AsyncIterable<string>) {
    for await (const line of source) {
      await client.query(`INSERT INTO ${table}(${column}) VALUES($1)`, [JSON.parse(line)])
      yield line
    }
  }*/
}

function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect((connectErr) => {
    if (connectErr !== null) {
      return console.error(
        'Failed to connect to PostgreSQL server.',
        connectErr,
      )
    }

    pipeline(
      process.stdin,
      split(),
      transporter(client) as any,
      process.stdout,
      (err) => {
        if (err != null) {
          console.error(err)
        }
      },
    )
  })
}

main()
