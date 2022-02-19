const puppeteer = require('puppeteer-core')
const nodemailer = require('nodemailer')
const express = require('express')
const app = express()
const moment = require('moment')
const cron = require('node-cron')
const sgMail = require('@sendgrid/mail')
require('dotenv').config()

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

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: 'karolis.kimtys@gmail.com', // Change to your recipient
      from: 'karolis_k_7@hotmail.com', // Change to your verified sender
      subject: 'Bloor Homes',
      text: html,
      html: `<strong>${moment().format('LLLL')}</strong>`
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

    await browser.close()

    console.log('Scraped on', moment().format('LLLL'))
  })
})()
