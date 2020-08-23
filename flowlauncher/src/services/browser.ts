const puppeteer = require('puppeteer')
const { serializeError } = require('serialize-error')
import { NodeVM } from 'vm2'
const parentLogger = require('pino')()
const fs = require('fs')
const path = require('path')
const del = require('del')
import * as AWS from 'aws-sdk'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

interface IRun {
  code(page: any): Promise<any>
  id: number
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

async function uploadScreenshots(dir: string, runId: number, logger: any) {
  const screenshotUrls = await Promise.all(
    fs
      .readdirSync(dir)
      .filter((file: string) =>
        ['.png', '.jpg'].includes(path.extname(file).toLowerCase()),
      )
      .map(async (file: string) => {
        const data = await fs.readFileSync(`${dir}/${file}`)
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: `${runId}/${file}`,
          Body: data,
        }
        return new Promise(function (resolve, reject) {
          try {
            s3.upload(params as PutObjectRequest, function (err, data) {
              if (err) {
                logger.error(err)
                reject(err)
              } else {
                logger.info(`Uploaded screenshot: ${data.Location}`)
                resolve(data.Location)
              }
            })
          } catch (e) {
            reject(e)
            logger.error(e)
          }
        })
      }),
  )

  return screenshotUrls.filter(Boolean)
}

export default class BrowserService {
  static async run({ code, id }: IRun) {
    const logger = parentLogger.child({ runId: id })

    const workDir = path.join(__dirname, `flowRun-${id}`)
    try {
      fs.mkdirSync(workDir)
      logger.info('Starting flow run')
      const browser = await puppeteer.launch({
        args: [
          // Required for Docker version of Puppeteer
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // This will write shared memory files into /tmp instead of /dev/shm,
          // because Docker’s default for /dev/shm is 64MB
          '--disable-dev-shm-usage',
        ],
      })
      const page = await browser.newPage()
      page.setDefaultTimeout(10000)

      const overriddenViewport = Object.assign(page.viewport(), { width: 1080 })
      await page.setViewport(overriddenViewport)

      const vm: any = new NodeVM({
        console: 'redirect',
        sandbox: {},
        require: {
          context: 'sandbox',
          external: [
            'xstate',
            '@xstate/test',
            'color-convert',
            'chalk',
            'escape-string-regexp',
            'ansi-styles',
            'color-name',
            'supports-color',
            'has-flag',
          ],

          builtin: ['assert', 'os', 'fs'],
          root: './',
          mock: {
            fs: {
              writeFileSync() {
                return 'nice try'
              },
              writeFile() {
                return 'nice try'
              },
              readFile() {
                return 'unh uh'
              },
              readFileSync() {
                return 'unh uh'
              },
            },
          },
        },
      })

      var makeSafe = function (fn: any) {
        return function (this: any) {
          const opts = arguments[0]
          if (!opts?.path) {
            logger.error('Please provide a screenshot path')
            return
          }
          return fn.apply(this, [{ path: path.join(workDir, opts.path) }])
        }
      }

      page.screenshot = makeSafe(page.screenshot)
      const logs = [] as any
      vm.on('console.log', (data: any) => {
        logs.push(['log', id, data])
      })

      vm.on('console.info', (data: any) => {
        logs.push(['info', id, data])
      })

      vm.on('console.warn', (data: any) => {
        logs.push(['warn', id, data])
      })

      vm.on('console.error', (data: any) => {
        logs.push(['error', id, data])
      })
      // This should be in the docker sandbox, and the file should have already been
      // mounted by the launcher process and be something like
      const handler = vm.run(code, './foo.js')

      // Should wrap this in try catch, and return a { result, error } object?
      let result, error, screenshotUrls
      try {
        result = await handler({ page, logger })
        screenshotUrls = await uploadScreenshots(workDir, id, parentLogger)
        logger.info('Flow run success')
      } catch (e) {
        logger.error('Caught errored flowRun, returning error')
        error = serializeError(e)
        result = serializeError(e)
      }

      browser.close()
      del(workDir)
      return { result, logs, screenshotUrls, error }
    } catch (e) {
      logger.error(`Unexpected flow run error: ${e}`)
      del(workDir)
      return { result: e }
    }
  }
}
