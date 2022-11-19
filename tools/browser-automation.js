require('dotenv').config()
const { Builder } = require('selenium-webdriver')
const driverOn = new Builder().forBrowser('chrome').build()
const stocks = require('../data/stock.json')
const crawler = require('./crawler')

async function browserAutomation () {
  const driver = await driverOn
  await crawler.getPrices(driver, stocks)
  await driver.quit()
}

browserAutomation()
