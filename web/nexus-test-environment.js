// tests/nexus-test-environment.js
const { Client } = require('pg')
const NodeEnvironment = require('jest-environment-node')
const { nanoid } = require('nanoid')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const prismaBinary = './node_modules/.bin/prisma'
const fetch = require('node-fetch')
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

    this.databaseUrl = `postgres://sample:pleasechangeme@postgres:5432/webtesting?schema=${this.schema}`
    this.redisUrl = `redis://h:${this.redisPassword}@${this.redisHost}:${this.redisPort}`
    this.apiIdentifier = 'https://hilltopTest'
    this.auth0Domain = 'dev-m01wp096.auth0.com'
    this.clientId = 'feGS4ZBtfi58AnYeVHnqYlAW56iudD8x'
    this.clientSecret =
      'sfFjdMIp5Lr13Cx9ZPnt3kUsL9KIZF39UHSpRi7na0g5QF1lfhZ1Nv9apkXT4QCe'
  }
  async setup() {
    process.env.REDIS_URL = this.redisUrl
    this.global.process.env.REDIS_URL = this.redisUrl
    process.env.DATABASE_URL = this.databaseUrl
    this.global.process.env.DATABASE_URL = this.databaseUrl
    this.global.process.env.API_IDENTIFIER = this.apiIdentifier
    this.global.process.env.AUTH0_DOMAIN = this.auth0Domain
    // Run the migrations to ensure our schema has the required structure
    await exec(`${prismaBinary} migrate up --create-db --experimental`)
    await exec(`node prisma/seeds`)
    await exec(
      `yarn rdcli -a ${this.redisPassword} -h ${this.redisHost} -p ${this.redisPort} FLUSHDB`,
    )

    try {
      const auth0Token = await fetch(
        'https://dev-m01wp096.auth0.com/oauth/token',
        {
          method: 'post',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            audience: this.apiIdentifier,
            username: 'admin@blue.blue',
            password: 'blueAdmin#22',
            grant_type: 'password',
          }),
        },
      )
      const { access_token } = await auth0Token.json()
      this.global.process.env.AUTH0_ACCESS_TOKEN = access_token
    } catch (e) {
      console.error(e)
    }

    return super.setup()
  }
  async teardown() {
    // Drop the schema after the tests have completed
    try {
      const client = new Client({
        connectionString: 'postgres://sample:pleasechangeme@postgres:5432',
      })
      await client.connect()
      await client.query(`DROP DATABASE webtesting`)
      // await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
      await client.end()
      await exec(
        `yarn rdcli -a ${this.redisPassword} -h ${this.redisHost} -p ${this.redisPort} FLUSHDB`,
      )
    } catch (e) {
      console.error(e)
    }
  }
}
module.exports = PrismaTestEnvironment
