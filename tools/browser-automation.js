require('dotenv').config()
const { Builder } = require('selenium-webdriver')
const driver = new Builder().forBrowser('chrome').build()

async function browserAutomation () {
  await driver
  await driver.get('https://www.selenium.dev/documentation/webdriver/')
  await driver.sleep(2000)
  await driver.get('https://www.npmjs.com/package/selenium-webdriver')
  await driver.sleep(2000)
  await driver.quit()
}

browserAutomation()
