const axios = require("axios");
const moment = require("moment");
const fs = require("fs/promises");
const mysql = require("mysql");
const Promise = require("bluebird");
require("dotenv").config();

// 建立連線
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection = Promise.promisifyAll(connection);

(async function () {
  try {
    await connection.connectAsync();

    //讀取STOCK.TXT
    let stockId = await fs.readFile("stock.txt", "utf-8");
    console.log(`股票番號 : ${stockId}`);
    let promise = await connection.queryAsync(
      `SELECT stock_id FROM stock WHERE stock_id = ?`,
      [stockId]
    );

    if (promise.length <= 0) {
      let response = await axios.get(
        `https://www.twse.com.tw/zh/api/codeQuery?query=${stockId}`
      );
      //   console.log(response);
      let answer = response.data.suggestions.shift();
      let answers = answer.split("\t");

      if (answers.length > 1) {
        connection.queryAsync(
          `INSERT INTO stock (stock_id, stock_name) VALUES (?)`,
          [answers]
        );
      } else {
        throw "股票名稱錯誤";
      }
    }
    // 查詢股票資料
    console.log(`查詢股票成交資料 ${stockId}`);
    let prices = await axios.get(
      "https://www.twse.com.tw/exchangeReport/STOCK_DAY",
      {
        params: {
          response: "json",
          date: moment().format("YYYYMMDD"),
          stockNo: stockId,
        },
      }
    );
    if (prices.data.stat !== "OK") {
      throw "查詢股價失敗";
    }
    let prepareData = prices.data.data.map((item) => {
      item = item.map((value) => {
        return value.replace(/,/g, "");
      });

      item[0] = parseInt(item[0].replace(/\//g, ""), 10) + 19110000; // 20210601
      item[0] = moment(item[0], "YYYYMMDD").format("YYYY-MM-DD"); // 2021-06-01
      item.unshift(stockId);
      return item;
    });
    // console.log(prepareData);
    let insertResult = await connection.queryAsync(
      "INSERT IGNORE INTO stock_price (stock_id, date, volume, amount, open_price, high_price, low_price, close_price, delta_price, transactions) VALUES ?",
      [prepareData]
    );
    console.log(insertResult);
  } catch (err) {
    console.error("有錯誤");
    console.error(err);
  } finally {
    connection.end();
  }
})();

// function readPromise() {
//   return new Promise(function (resolve, reject) {
//     fs.readFile("stock.txt", "utf-8", function (err, data) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }

// readPromise()
//   .then((data) => {
//     console.log(`股票番號: ${data}`);
//     return axios.get("https://www.twse.com.tw/exchangeReport/STOCK_DAY", {
//       params: {
//         response: "json",
//         date: moment().format("YYYYMMDD"),
//         stockNo: data,
//       },
//     });
//   })
//   .then(function (response) {
//     if (response.data.stat === "OK") {
//       console.log("選擇日期:", response.data.date);
//       console.log(response.data.title);
//     }
//   })
//   .catch((err) => {
//     console.error(err);
//   });

// axios
//   .get("https://www.twse.com.tw/exchangeReport/STOCK_DAY?", {
//     params: {
//       response: "json",
//       date: "20210523",
//       stockNo: "2610",
//     },
//   })
//   .then(function (response) {
//     let result = response.data;
//     console.log(result.date);
//     console.log(result.title);
//   })
//   .catch(function (error) {
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });
