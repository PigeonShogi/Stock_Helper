require('dotenv').config()
const CronJob = require('cron').CronJob
const { browserAutomationDaily } = require('./browser-automation')

const dailyJob = new CronJob(
  process.env.SCHEDULE_TIME_DAILY1,
  async () => {
    console.info('排程作業啟用中')
    let isCrawlerRun = false // 用以檢查爬蟲是否執行中
    try {
      if (!isCrawlerRun) { // 程式運作期間僅執行一隻爬蟲
        isCrawlerRun = true
        console.info(`排程作業啟動爬蟲 ${new Date()}`)
        await browserAutomationDaily()
        isCrawlerRun = false
        console.info('排程作業執行完畢')
      } else {
        throw new Error('排程管理偵測到啟動中的爬蟲，故未啟用排程')
      }
    } catch (err) { console.error(err) }
  }
)

dailyJob.start()
