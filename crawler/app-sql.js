const Promise = require("bluebird");
const fs = require("fs/promises");
const axios = require("axios");
const mysql = require("mysql");


// 建立連線
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "stock"
});

connection = Promise.promisifyAll(connection);

(async function () {
    try {
      await connection.connectAsync();
  
      //讀取STOCK.TXT  
      let stockId = await fs.readFile("stock.txt", "utf-8");
      console.log(`股票番號 : ${stockId}`);
      let promise = await connection.queryAsync(`SELECT stock_id FROM stock WHERE stock_id = ${stockId}`);
  
      if (promise.length <= 0) {
          let response = await axios.get(`https://www.twse.com.tw/zh/api/codeQuery?query=${stockId}` )
        //   console.log(response);
      let answer = response.data.suggestions.shift();
      let answers = answer.split("\t");
          
          if (answers.length > 1) {
              
              connection.queryAsync(`INSERT INTO stock (stock_id, stock_name) VALUES ('${answers[0]}', '${answers[1]}')`);
          }
      }
  } catch (err) {
      console.error (err);
  } finally {
    //   關閉連線
      connection.end();
  }
  })();