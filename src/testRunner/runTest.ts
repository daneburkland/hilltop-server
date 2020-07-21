const fs = require('fs')
const path = require('path')
import BrowserService from './services/browser'

const job = fs.readFileSync('../../job/job.txt')
const parsed = JSON.parse(job)

async function findScreenshots() {
  await fs.readdirSync('/').forEach(async (file: string) => {
    if (['.png', '.jpg'].includes(path.extname(file).toLowerCase())) {
      await fs.writeFileSync(`job/${file}`, file)
    }
  })
}

async function run() {
  try {
    const result = await BrowserService.run(parsed)
    await findScreenshots()
    console.log(JSON.stringify(result))
  } catch (e) {
    console.log(JSON.stringify({ result: e }))
  }
}

run()
