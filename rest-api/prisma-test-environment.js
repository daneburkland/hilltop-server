const { Client } = require('pg')
const NodeEnvironment = require('jest-environment-node')
const { nanoid } = require('nanoid')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const prismaBinary = './node_modules/.bin/prisma'
/**
 * Custom test environment for Nexus, Prisma and Postgres
 */
class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    // Generate a unique schema identifier for this test context
    this.schema = `test_${nanoid()}`
    // Generate the pg connection string for the test schema
    this.databaseUrl = `postgres://sample:pleasechangeme@postgres:5432/restApiTesting?schema=${this.schema}`
    this.redisUrl = `redis://h:pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea@ec2-3-226-208-170.compute-1.amazonaws.com:8279`
  }
  async setup() {
    // Set the required environment variable to contain the connection string
    // to our database test schema
    process.env.DATABASE_URL = this.databaseUrl
    this.global.process.env.DATABASE_URL = this.databaseUrl
    process.env.REDIS_URL = this.redisUrl
    this.global.process.env.REDIS_URL = this.redisUrl
    // Run the migrations to ensure our schema has the required structure
    await exec(`${prismaBinary} migrate up --create-db --experimental`)
    await exec(`node prisma/seeds`)
    await exec(
      `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
    )
    return super.setup()
  }
  async teardown() {
    // Drop the schema after the tests have completed
    try {
      const client = new Client({
        connectionString: this.databaseUrl,
      })
      await client.connect()
      await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
      await client.end()
      await exec(
        `yarn rdcli -a 'pe09526a88f79285d708d6b8edc4ad6291d0c3ff612aac707d1fd28b3fc3aa4ea' -h ec2-3-226-208-170.compute-1.amazonaws.com -p 8279 FLUSHDB`,
      )
    } catch (e) {
      console.error(e)
    }
  }
}
module.exports = PrismaTestEnvironment
