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
  }
}
