# Stock Helper 存股小幫手
## 專案簡述
本專案為個人化存股輔助工具。
有別於證券公司的看盤軟體等手機 APP，本專案著重於輕量化與個人化，不需在手機安裝 APP，也能透過 LINE 及 Google Sheets 掌握個人化存股資訊。
主要使用技術為 Node.js，搭配 Selenium Webdriver 實現瀏覽器自動化爬蟲，並輔以排程套件及 LINE Notify，定期提醒使用者觀察股價或定期定額存股。
## 專案開發筆記
```
https://pigeonshogi.github.io/tags/瀏覽器自動化/
```
## 專案設定
1. 將本專案下載至本地
```
$ git clone https://github.com/PigeonShogi/Stock_Helper.git
```
2. 進入專案資料夾
```
$ cd stock_helper
```
3. 安裝所需套件
```
$ npm install
```
4. 建立檔案 .env 並設定環境變數
```
環境變數設定請參考 .env.example
```
5. 啟動排程檔案
```
$ npm run daily
$ npm run monthly
```
### 開發環境
macOS Monterey: 12.2.1 (21D62)
Google Chrome: 107.0.5304.87 (正式版本) (x86_64)
### 主要開發工具
Node.js 18.12.1
selenium-webdriver 4.6.1
googleapis 105.0.0
@google-cloud/local-auth 2.1.0
cron 2.1.0
##### 提示
* 本專案也可搭配排程管理套件 pm2