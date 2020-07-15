const puppeteer = require('puppeteer')
import { NodeVM } from 'vm2'
import { logger as parentLogger } from '../workers/tasks/runTest'

interface IRun {
  code(page: any): Promise<any>
  runs: any
}

export default class BrowserService {
  static async run({ code, runs }: IRun) {
    const logger = parentLogger.child({ testRunId: runs[0].id })
    const logs = [] as Array<String>
    try {
      logger.info('Starting test run')
      // const originalStdoutWrite = process.stdout.write.bind(process.stdout)

      // rewrite user supplied stdout with pino
      process.stdout.write = (chunk: any, encoding: any, callback: any) => {
        logger.info(chunk)

        // return originalStdoutWrite(chunk, encoding, callback)
      }

      const browser = await puppeteer.launch({})
      const page = await browser.newPage()
      page.setDefaultTimeout(10000)

      const overriddenViewport = Object.assign(page.viewport(), { width: 1080 })
      await page.setViewport(overriddenViewport)

      const vm: any = new NodeVM({
        require: {
          external: ['xstate', '@xstate/test'],
          builtin: ['assert'],
        },
      })
      const handler = vm.run(code, './foo.js')

      // Should wrap this in try catch, and return a { result, error } object?
      const result = await handler({ page })

      // browser.close()
      logger.info('Test run success')

      return { result, logs }
    } catch (e) {
      logger.error(`Test run error: ${e}`)
      return { result: e, logs }
    }
  }
}
