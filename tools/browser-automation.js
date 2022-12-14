require('dotenv').config()
const { Builder } = require('selenium-webdriver')
// 引用瀏覽器選項模組
const { disableGpu, headless, imageOff, shmUsage } = require('../config/chrome-options')
const driverOn = new Builder().setChromeOptions(disableGpu, headless, imageOff, shmUsage).forBrowser('chrome').build()
const stocks = require('../data/stock.json') // 引用個股資料
const crawler = require('./crawler') // 引用爬蟲模組
// 引用 Google Sheets API 相關函式
const { authorize, updateDividendCashFlow, updatePrices, sortByCodeASC } = require('./google_sheets/index')
// 引用 LINE Notify 函式
const lineNotify = require('./line-notify')

// 瀏覽器自動化腳本：每日更新股價
async function browserAutomationDaily () {
  const driver = await driverOn
  console.info('爬蟲開始工作')
  // 從 Goodinfo! 爬取股價
  const prices = await crawler.getPrices(driver, stocks)
  // 將爬取的股價寫入 Google Sheet。GCP API 採用 Promise 語法。
  authorize()
    .then(auth => sortByCodeASC(auth))
    .then(auth => updatePrices(auth, prices))
    .catch(console.error)
  lineNotify(`股價更新完畢。看看最近哪一檔存股標的比較划算吧！${process.env.SHEET_URL}`)
  // 為避免執行排程程式時發生 NoSuchSessionError，停用瀏覽器關閉功能。
  // await driver.quit()
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
  lineNotify(`每月定期定額存股的時間到了。看看最近哪一檔存股標的比較划算吧！${process.env.SHEET_URL}`)
  // 為避免執行排程程式時發生 NoSuchSessionError，停用瀏覽器關閉功能。
  // await driver.quit()
  console.info('爬蟲結束工作')
}

module.exports = {
  browserAutomationDaily,
  browserAutomationMonthly
}
