puppeteer = require('puppeteer-core')
require('dotenv').config()
const nodemailer = require('nodemailer')
var prettyjson = require('prettyjson')

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
    'https://bloorhomes.com/developments/oxfordshire/crowmarsh-gifford/wallingford-reach'
}

let data = []

async function getData(link) {
  const browserFetcher = puppeteer.createBrowserFetcher()
  let revisionInfo = await browserFetcher.download('884014')

  browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    headless: false,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  })

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
    Developement: link,
    Details: combined
  }

  data.push(developement)

  setTimeout(async () => {
    await browser.close()
  }, 60000)
}

const run = async () => {
  await Promise.all(Object.values(list).map(async (link) => getData(link)))

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'karolis.kimtys@gmail.com',
      pass: process.env.GOOGLE_PASSWORD
    }
  })

  var mailOptions = {
    from: 'Bloor Homes Scraper karolis.kimtys@gmail.com',
    to: 'karolis.kimtys@gmail.com',
    subject: 'Bloor Homes Developements',
    text: JSON.stringify(data, null, '\t')
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error', error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

run()
