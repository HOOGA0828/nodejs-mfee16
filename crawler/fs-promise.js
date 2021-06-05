const axios = require("axios");
const moment = require("moment");
const fs = require("fs/promises");

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

fs.readFile("stock.txt", "utf-8")
  .then((data) => {
    console.log(`股票番號: ${data}`);
    return axios.get("https://www.twse.com.tw/exchangeReport/STOCK_DAY", {
      params: {
        response: "json",
        date: moment().format("YYYYMMDD"),
        stockNo: data,
      },
    });
  })
  .then(function (response) {
    if (response.data.stat === "OK") {
      console.log("選擇日期:", response.data.date);
      console.log(response.data.title);
    }
  })
  .catch((err) => {
    console.error(err);
  });

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
