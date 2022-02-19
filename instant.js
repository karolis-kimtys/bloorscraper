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

console.log('Starting browser')

async function getData(link) {
  const browserFetcher = puppeteer.createBrowserFetcher()
  let revisionInfo = await browserFetcher.download('884014')

  const browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    headless: true,
    args: ['--no-sandbox', '--disabled-setupid-sandbox']
  })

  console.log('Cron job started', moment().format('LLLL'))

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
    Developement: await Object.keys(list).find((key) => list[key] === link),
    Details: await combined
  }

  await data.push(developement)

  await browser.close()

  console.log('Cron job finished', moment().format('LLLL'))
}

const run = async () => {
  cron.schedule('*/30 * * * * *', async () => {
    await Promise.all(Object.values(list).map(async (link) => getData(link)))

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
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
  })
}

run()
