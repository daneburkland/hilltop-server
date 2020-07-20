const fs = require('fs')
import BrowserService from '../../services/browser'

const job = fs.readFileSync('../../job/job.txt')
const parsed = JSON.parse(job)

async function run() {
  const result = await BrowserService.run(parsed)
}

run()
