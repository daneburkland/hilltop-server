const fs = require('fs')
const path = require('path')
import BrowserService from './services/browser'

const job = fs.readFileSync('../../job/job.txt')
const parsed = JSON.parse(job)

// TODO: should I just make a wrapper of the page.screenshot method?
async function findScreenshots() {
  await fs.readdirSync('/').forEach(async (file: string) => {
    if (['.png', '.jpg'].includes(path.extname(file).toLowerCase())) {
      const data = await fs.readFileSync(file)
      await fs.writeFileSync(`job/${file}`, data)
    }
  })
}

async function run() {
  try {
    await BrowserService.run(parsed)
    await findScreenshots()
  } catch (e) {
    console.log(JSON.stringify({ result: e }))
  }
}

run()
