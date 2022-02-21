const puppeteer = require('puppeteer-core')
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron')
const moment = require('moment')
require('dotenv').config()

const list = {
  TheFairways:
    'https://bloorhomes.com/developments/berkshire/near-bracknell/the-fairways',
  OnTheGreen:
    'https://bloorhomes.com/developments/hampshire/basingstoke/bloor-homes-on-the-green',
  ThameMeadows:
    'https://bloorhomes.com/developments/oxfordshire/thame/thame-meadows',
  LakeSideGardens:
    'https://bloorhomes.com/developments/berkshire/arborfield/lakeside-gardens',
  ShinfieldGardens:
    'https://bloorhomes.com/developments/berkshire/shinfield/shinfield-gardens',
  ShinfieldMeadows:
    'https://bloorhomes.com/developments/berkshire/shinfield/shinfield-meadows',
  AshGreen:
    'https://bloorhomes.com/developments/surrey/ash-green/bloor-homes-at-ash-green',
  RedKiteView:
    'https://bloorhomes.com/developments/oxfordshire/watlington/red-kite-view',
  WallingfordReach:
    'https://bloorhomes.com/developments/oxfordshire/crowmarsh-gifford/wallingford-reach',
  OrielGardens:
    'https://bloorhomes.com/developments/oxfordshire/faringdon/oriel-gardens'
}

let data = []

console.log('Scraper started on', moment().format('LLLL'))

const startBrowser = async () => {
  let browserFetcher = puppeteer.createBrowserFetcher()
  let revisionInfo = await browserFetcher.download('884014')

  let browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    timeout: 0,
    headless: true,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  })

  return browser
}

const getData = async (link, index, browser) => {
  setTimeout(async () => {
    console.log(`Job ${index} started at`, moment().format('LTS'))

    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
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

    const combined = await title.map(function (title, index) {
      return {
        title: title,
        details: body[index]
          .split('\n')
          .join('-')
          .split(' ')
          .join('')
          .split('-')
          .join(' ')
      }
    })

    const developement = {
      Developement: await Object.keys(list).find((key) => list[key] === link),
      Details: await combined
    }

    await data.push(developement)

    console.log(`Job ${index} completed at`, moment().format('LTS'))
  }, index * 30000)
}

const sendMail = async () => {
  data = JSON.stringify(data, null, '\t').replace(/[{","}]/g, '')

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: 'karolis.kimtys@gmail.com',
    from: 'karolis_k_7@hotmail.com',
    subject: 'Bloor Homes Developements',
    text: data
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent at', moment().format('LLLL'))
    })
    .catch((error) => {
      console.error(error)
    })
  // startBrowser().then(async (browser) => {
  //   await browser.close()
  //   console.log('All browsers closed')
  // })
}

const run = async () => {
  startBrowser().then(async (browser) => {
    const allPromises = new Promise((resolve) => {
      Object.values(list).map((link, key) => {
        getData(link, key, browser)
      })
      setTimeout(() => {
        resolve()
      }, 300000)
    })

    allPromises.then(() => {
      sendMail(browser)
      console.log('Finished')
    })
  })
}

run()

// cron.schedule('*/60 * * * *, () => {
//   console.log('Cron scraper')
//   run()
// })
