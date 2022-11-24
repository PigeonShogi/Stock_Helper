const { By, until } = require('selenium-webdriver')
const variables = require('../data/variables')

module.exports = {
  // 爬取多檔個股的成交價
  getPrices: async (driver, stockArray) => {
    try {
      const prices = []
      for (const stock of stockArray) {
        // 爬蟲前往個股網頁
        await driver.get(`${variables.urlStockBase}${stock.code}`)
        const closingPrice = await driver.wait(until.elementLocated(By.xpath(variables.xPathClosingPrice))).getText() // 爬蟲取得成交價
        console.info(`爬蟲取回資料：${stock.name} 股價：${closingPrice}`)
        prices.push([parseFloat(closingPrice)])
        await driver.sleep(3000) // 瀏覽器稍微停頓，免得對伺服器造成太大負擔。
      }
      return prices
    } catch (err) { console.error(err) }
  },
  // 爬取各商品近十年股利
  getDividendCashFlow: async (driver, stockArray) => {
    try {
      // 爬取陣列中每一檔股票的近十年股利
      const dividendCashFlow = []
      for (const stock of stockArray) {
        let dividendSum = 0
        await driver.get(`${variables.urlStockDividend}${stock.code}`)
        await driver.wait(until.elementLocated(By.xpath('//*[@id="tblDetail"]/tbody/tr[14]/td[19]')), 3000)
        for (let i = 5; i <= 14; i++) {
          const dividend = await driver.findElement(By.xpath(`//*[@id="tblDetail"]/tbody/tr[${i}]/td[19]`)).getText()
          dividendSum += parseFloat(dividend)
        }
        dividendCashFlow.push([dividendSum / 10])
        // 讓爬蟲稍微休息，避免對伺服器造成負擔。
        await driver.sleep(3000)
        console.info('爬蟲已擷取一筆資料', dividendCashFlow)
      }
      return dividendCashFlow
    } catch (err) { console.error(err) }
  }
}
