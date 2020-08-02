const puppeteer = require('puppeteer')
import { NodeVM, VMScript } from 'vm2'
const parentLogger = require('pino')()

interface IRun {
  code(page: any): Promise<any>
  id: Number
}

export default class BrowserService {
  static async run({ code, id }: IRun) {
    const logger = parentLogger.child({ runId: id })
    try {
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

      // const screenshotsHandler = vm.run(screenshotScript)
      // const screenshots = await screenshotsHandler()

      // browser.close()
      logger.info('Flow run success')

      return { result }
    } catch (e) {
      logger.error(`Flow run error: ${e}`)
      return { result: e }
    }
  }
}
