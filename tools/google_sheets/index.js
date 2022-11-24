require('dotenv').config()
const fs = require('fs').promises
const path = require('path')
const process = require('process')
const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')
const stocks = require('../../data/stock.json') // 引用個股資料

// SCOPES 經修改後應刪除 token.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_PATH = path.join(process.cwd(), 'tools/google_sheets/token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'tools/google_sheets/credentials.json')

/**
 * 從既有檔案讀取已授權憑證
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist () {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

/**
 * 將憑證序列化為與 Google AUth.fromJSON 相容的文件
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials (client) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

// 加載、請求或授權調用 API
async function authorize () {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  })
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

/**
 * 將爬蟲擷取的股價寫入資料表
 * @param {google.auth.OAuth2} auth 經過身份驗證的 Google OAuth 用戶
 */
async function updatePrices (auth, array) {
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1!C2:C',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: array
    }
  })
  console.info(`HTTP狀態碼：${res.status} => Google Sheet 已更新最近成交價`)
}

/**
 * 在爬蟲更新資料前，將資料依照股票代號由小至大排序。
 * @param {google.auth.OAuth2} auth 經過身份驗證的 Google OAuth 用戶
 */
async function sortByCodeASC (auth) {
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SHEET_ID,
    resource: {
      requests: [
        {
          sortRange: {
            range: {
              startColumnIndex: 0,
              startRowIndex: 1
            },
            sortSpecs: [
              {
                sortOrder: 'ASCENDING'
              }
            ]
          }
        }
      ]
    }
  })
  console.info(`HTTP狀態碼：${res.status} => Google Sheet 已按照股票代號排序資料`)
  // 本函式不會單獨使用，後面會銜接寫入資料的函式，因此在此回傳 auth 供下個函式使用。
  return auth
}

/**
 * 將爬蟲擷取的近十年股利平均（股利現金流）寫入資料表
 * @param {google.auth.OAuth2} auth 經過身份驗證的 Google OAuth 用戶
 */
async function updateDividendCashFlow (auth, array) {
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1!D2:D',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: array
    }
  })
  console.info(`HTTP狀態碼：${res.status} => 已追蹤股利現金流並寫入 Google Sheet`)
}

/**
 * 將 data/stock.json 儲存的股票代號、商品名稱插入 Google Sheet
 * @param {google.auth.OAuth2} auth 經過身份驗證的 Google OAuth 用戶
 */
async function batchInsertCodeAndName (auth) {
  // 從 data/stock.json 引入股票代號、商品名稱
  const codeArray = stocks.map(stock => { return [stock.code] })
  const nameArray = stocks.map(stock => { return [stock.name] })
  const sheets = google.sheets({ version: 'v4', auth })
  // 先清空股票代號及商品名稱欄位的所有資料，以免插入結果不如預期。
  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1!A2:B'
  })
  // 插入股票代號、商品名稱
  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SHEET_ID,
    resource: {
      /*
      為避免股票代號 0056 被解析為數字 56，
      valueInputOption 的值需為 RAW 而非 USER_ENTERED
      */
      valueInputOption: 'RAW',
      data: [
        {
          range: 'Sheet1!A2:A',
          values: codeArray
        },
        {
          range: 'Sheet1!B2:B',
          values: nameArray
        }
      ]
    }
  })
  console.info(`HTTP狀態碼：${res.status} => 股票代號、商品名稱已經插入 Google Sheet`)
}

// data/stock.json 內容有變動時，執行下列註解程式，以重新插入股票代號及商品名稱。
// authorize()
//   .then(auth => batchInsertCodeAndName(auth))
//   .catch(console.error)

module.exports = {
  authorize,
  sortByCodeASC,
  updateDividendCashFlow,
  updatePrices
}
