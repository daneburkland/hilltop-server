type Log = {
  level: string
  msg: string
  stack: string | null
}

export interface JobResult {
  result: any
  screenshotUrls: Array<string>
  logs: Array<Log>
  error: any
  id: number
}
