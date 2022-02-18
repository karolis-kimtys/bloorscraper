puppeteer = require('puppeteer-core')
require('dotenv').config()
const nodemailer = require('nodemailer')
const express = require('express')
const app = express()
const moment = require('moment')
var cron = require('node-cron')

console.log('Started scraping on', moment().format('LLLL'))
;(async function () {
  console.log('Fetching browser')
  const browserFetcher = puppeteer.createBrowserFetcher()
  let revisionInfo = await browserFetcher.download('884014')

  cron.schedule('*/10 * * * * *', async () => {
    browser = await puppeteer.launch({
      executablePath: revisionInfo.executablePath,
      headless: true,
      args: ['--no-sandbox', '--disabled-setupid-sandbox']
    })

    console.log('Scraping...')
    const page = await browser.newPage()
    await page.goto(
      'https://bloorhomes.com/developments/surrey/ash-green/bloor-homes-at-ash-green',
      { waitUntil: 'networkidle2' }
    )

    const html = await page.$eval(
      '.development-banner__text',
      (e) => e.outerHTML
    )

    var notes = html.split('"')[1] === 'development-banner__text'

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'karolis.kimtys@gmail.com',
        pass: process.env.GOOGLE_PASSWORD
      }
    })

    var mailOptions = {
      from: 'karolis.kimtys@gmail.com',
      to: 'karolis.kimtys@gmail.com',
      subject:
        notes === true
          ? 'Bloor Homes Ash Green Not Yet Available'
          : '***Bloor Homes Ash Green Available!!!!',
      text: moment().format('LLLL')
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Error', error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })

    await browser.close()

    console.log('Scraped on', moment().format('LLLL'))
  })
})()
