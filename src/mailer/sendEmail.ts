import { Job, DoneCallback } from 'bull'
const nodemailer = require('nodemailer')
const logger = require('pino')()
const aws = require('aws-sdk')

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
})

const sendEmail = async (job: Job, done: DoneCallback) => {
  let mailOptions = {
    from: 'hilltop.test.email@gmail.com',
    to: job.data.email,
    subject: 'Join Hilltop',
    text: `Join Hilltop: ${job.data.url}`,
  }

  logger.info(`Sending email to: ${job.data.email}`)

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    SES: new aws.SES({
      apiVersion: '2010-12-01',
    }),
  })

  try {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        logger.error(`Failed to send email ${err}`)
        done(err)
      } else {
        logger.info(`Sent email ${JSON.stringify(info)}`)
        done(null, info)
      }
    })
  } catch (e) {
    logger.error(e)
  }
}

export default sendEmail
