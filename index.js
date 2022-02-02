const puppeteer = require('puppeteer')
var nodemailer = require('nodemailer')
const express = require('express')
const app = express()
const moment = require('moment')
require('dotenv').config()

console.log('Started scraping on', moment().format('LLLL'))
;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    'https://bloorhomes.com/developments/surrey/ash-green/bloor-homes-at-ash-green',
    { waitUntil: 'networkidle2' }
  )

  const html = await page.$eval('.development-banner__text', (e) => e.outerHTML)

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
})()
