const puppeteer = require('puppeteer')
import { NodeVM, VMScript } from 'vm2'
import { logger as parentLogger } from '../workers/tasks/launchTest'

interface IRun {
  code(page: any): Promise<any>
  id: Number
}

const screenshotScript = new VMScript(`
const fs = require('fs')
module.exports = function() {
  const filenames = fs.readdirSync(__dirname)
  return filenames
}
`)

export default class BrowserService {
  static async run({ code, id }: IRun) {
    const logger = parentLogger.child({ testRunId: id })
    const logs = [] as Array<String>
    try {
      logger.info('Starting test run')
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
        require: {
          external: ['xstate', '@xstate/test'],
          builtin: ['assert', 'fs'],
        },
      })
      // This should be in the docker sandbox, and the file should have already been
      // mounted by the launcher process and be something like
      const handler = vm.run(code, './foo.js')

      // Should wrap this in try catch, and return a { result, error } object?
      const result = await handler({ page, logger })

      const screenshotsHandler = vm.run(screenshotScript)
      const screenshots = await screenshotsHandler()

      // browser.close()
      logger.info('Test run success')

      return { result, logs }
    } catch (e) {
      logger.error(`Test run error: ${e}`)
      return { result: e, logs }
    }
  }
}
