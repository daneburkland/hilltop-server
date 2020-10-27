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
    this.redisHost = 'ec2-3-85-254-196.compute-1.amazonaws.com'
    this.redisPort = '18429'
    this.redisPassword =
      'p7a9099376bc893b95cc22b57bc575e9b5ed3406f288f0507f5620603543ca5cf'

    // Generate the pg connection string for the test schema
    // TODO: gitignore
    this.databaseUrl = `postgres://sample:pleasechangeme@postgres:5432/flowlaunchertesting?schema=${this.schema}`
    this.redisUrl = `redis://h:${this.redisPassword}@${this.redisHost}:${this.redisPort}`
    this.s3Bucket = 'hilltop-screenshots-test'
  }
  async setup() {
    process.env.REDIS_URL = this.redisUrl
    this.global.process.env.REDIS_URL = this.redisUrl
    process.env.DATABASE_URL = this.databaseUrl
    this.global.process.env.DATABASE_URL = this.databaseUrl
    process.env.S3_BUCKET = this.s3Bucket
    this.global.process.env.S3_BUCKET = this.s3Bucket

    // Run the migrations to ensure our schema has the required structure
    await exec(`${prismaBinary} migrate up --create-db --experimental`)
    await exec(`node prisma/seeds`)
    await exec(
      `yarn rdcli -a ${this.redisPassword} -h ${this.redisHost} -p ${this.redisPort} FLUSHDB`,
    )
    await exec(
      `yarn rdcli -a ${this.redisPassword} -h ${this.redisHost} -p ${this.redisPort} CLIENT KILL TYPE normal`,
    )

    return super.setup()
  }
  async teardown() {
    // Drop the schema after the tests have completed
    try {
      const client = new Client({
        connectionString: 'postgres://sample:pleasechangeme@postgres:5432',
      })
      await client.connect()
      // TODO: can I revert this?
      await client.query(`DROP DATABASE flowlaunchertesting`)
      // await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
      await client.end()
    } catch (e) {
      console.error(e)
    }
  }
}
module.exports = PrismaTestEnvironment
