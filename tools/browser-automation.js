require('dotenv').config()
const { Builder } = require('selenium-webdriver')
// 引用瀏覽器選項模組
const { disableGpu, headless, imageOff, shmUsage } = require('../config/chrome-options')
const driverOn = new Builder().setChromeOptions(disableGpu, headless, imageOff, shmUsage).forBrowser('chrome').build()
const stocks = require('../data/stock.json')
const crawler = require('./crawler')

async function browserAutomation () {
  const driver = await driverOn
  await crawler.getPrices(driver, stocks)
  await driver.quit()
}

browserAutomation()
