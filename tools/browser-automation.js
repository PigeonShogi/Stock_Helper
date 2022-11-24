require('dotenv').config()
const { Builder } = require('selenium-webdriver')
// 引用瀏覽器選項模組
const { disableGpu, headless, imageOff, shmUsage } = require('../config/chrome-options')
const driverOn = new Builder().setChromeOptions(disableGpu, headless, imageOff, shmUsage).forBrowser('chrome').build()
const stocks = require('../data/stock.json') // 引用個股資料
const crawler = require('./crawler') // 引用爬蟲模組
// 引用 Google Sheets API 相關函式
const { authorize, updateDividendCashFlow, updatePrices } = require('./google_sheets/index')

// 瀏覽器自動化腳本：每日更新股價
async function browserAutomationDaily () {
  const driver = await driverOn
  console.info('爬蟲開始工作')
  // 從 Goodinfo! 爬取股價
  const prices = await crawler.getPrices(driver, stocks)
  // 將爬取的股價寫入 Google Sheet。GCP API 採用 Promise 語法。
  authorize()
    .then(auth => updatePrices(auth, prices))
    .catch(console.error)
  await driver.quit()
  console.info('爬蟲結束工作')
}

// 瀏覽器自動化腳本：每月追蹤股利現金流
async function browserAutomationMonthly () {
  const driver = await driverOn
  console.info('爬蟲開始工作')
  // 從 Goodinfo! 爬取股利現金流
  const dividendCashFlow = await crawler.getDividendCashFlow(driver, stocks)
  // 將爬取的股利現金流寫入 Google Sheet。GCP API 採用 Promise 語法。
  authorize()
    .then(auth => updateDividendCashFlow(auth, dividendCashFlow))
    .catch(console.error)
  await driver.quit()
  console.info('爬蟲結束工作')
}

browserAutomationMonthly()
