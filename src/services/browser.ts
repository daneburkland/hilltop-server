const puppeteer = require('puppeteer')
import { NodeVM } from 'vm2'
const logger = require('pino')()

interface IRun {
  code(page: any): Promise<any>
}

export default class BrowserService {
  static async run({ code }: IRun) {
    logger.info('Starting test run')
    const logs = [] as Array<String>
    try {
      // const originalStdoutWrite = process.stdout.write.bind(process.stdout)

      // process.stdout.write = (chunk: any, encoding: any, callback: any) => {
      //   if (typeof chunk === 'string') {
      //     logs.push(chunk)
      //   }

      //   return originalStdoutWrite(chunk, encoding, callback)
      // }

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
