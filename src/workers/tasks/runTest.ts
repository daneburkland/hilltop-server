const fs = require('fs')
import BrowserService from '../../services/browser'

const job = fs.readFileSync('../../job/job.txt')
const parsed = JSON.parse(job)

async function run() {
  try {
    const result = await BrowserService.run(parsed)
    console.log(JSON.stringify(result))
  } catch (e) {
    console.log(JSON.stringify({ result: e }))
  }
}

run()
