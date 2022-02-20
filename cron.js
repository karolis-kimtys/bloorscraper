const puppeteer = require('puppeteer-core')
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron')
const moment = require('moment')
require('dotenv').config()

const urls = [
  'https://bloorhomes.com/developments/berkshire/near-bracknell/the-fairways',

  'https://bloorhomes.com/developments/hampshire/basingstoke/bloor-homes-on-the-green',

  'https://bloorhomes.com/developments/oxfordshire/thame/thame-meadows',

  'https://bloorhomes.com/developments/berkshire/arborfield/lakeside-gardens',

  'https://bloorhomes.com/developments/berkshire/shinfield/shinfield-gardens',

  'https://bloorhomes.com/developments/berkshire/shinfield/shinfield-meadows',

  'https://bloorhomes.com/developments/surrey/ash-green/bloor-homes-at-ash-green',

  'https://bloorhomes.com/developments/oxfordshire/watlington/red-kite-view',

  'https://bloorhomes.com/developments/oxfordshire/crowmarsh-gifford/wallingford-reach',

  'https://bloorhomes.com/developments/oxfordshire/faringdon/oriel-gardens'
]

let data = []

// cron.schedule('*/10 * * * * *', (list) => {
//   Object.values(list).map((link) => {
//     console.log('🚀 - file: cron.js - line 35 - link', link)
//   })
// })

console.log('Started')

const startBrowser = async () => {
  console.log('Starting browser')

  let browserFetcher = puppeteer.createBrowserFetcher()
  let revisionInfo = await browserFetcher.download('884014')

  let browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    headless: true,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  })

  console.log('Browser started')

  return browser
}

const getData = async (seconds, link, browser) => {
  console.log('Promise', seconds, '-', link)

  return new Promise(async (resolve, reject) => {
    const page = await browser.newPage()

    await page.goto(link, {
      waitUntil: 'networkidle2'
    })

    const title = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('.o-development-homes__card__header'),
        (element) => element.textContent
      )
    )

    const body = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('.o-development-homes__card__body'),
        (element) => element.textContent
      )
    )

    await console.log('Title', title)
  }).then(() => {
    resolve()
  })

  // const combined = await title.map(function (title, index) {
  //   return {
  //     title: title,
  //     details: body[index]
  //       .split('\n')
  //       .join('-')
  //       .split(' ')
  //       .join('')
  //       .split('-')
  //       .join(' ')
  //   }
  // })

  // const developement = {
  //   Developement: await Object.keys(list).find((key) => list[key] === link),
  //   Details: await combined
  // }

  // await data.push(developement)

  // data = JSON.stringify(data, null, '\t').replace(/[{","}]/g, '')

  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // const msg = {
  //   to: 'karolis.kimtys@gmail.com',
  //   from: 'karolis_k_7@hotmail.com',
  //   subject: 'Bloor Homes Developements',
  //   text: data
  // }
  // sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log('Email sent')
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //   })
}

const run = async (urls) => {
  startBrowser().then(async (browser) => {
    console.log('Browser loaded successfully')

    for (let i = 0; i < urls.length; i++) {
      getData(i, urls[i], browser)
    }

    // for (let i = 0; i < urls.length; i++) {
    //   // console.log('URL', urls[i])

    //   await getData(urls[i])
    // }

    // myPromise.then(() => {
    //   browser.close().then(() => {
    //     console.log('Browser closed')
    //   })
    // })

    // Object.entries(urls).map(async (link) => {
    //   // console.log('Name', link[0], 'Link', link[1])

    //   const prom = new Promise(async (resolve, reject) => {
    //     console.log('Open new page')
    //     const page = await browser.newPage()
    //     await page.goto(link, {
    //       waitUntil: 'networkidle2'
    //     })
    //   }, 1000)
    //   prom.then(async (response) => {
    //     console.log(response)
    //   })
    // })
  })
}

run(urls)
