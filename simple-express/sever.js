const connection = require("./utils/db");

const express = require("express");

let app = express();

//中間件

app.use(express.static("public"));

// 第一個是變數
// 第二個是檔案名稱
app.set("views", "views");
// 告訴 express 我們用的是 view engine 是 pug
app.set("view engine", "pug");

app.use(function (req, res, next) {
  let current = new Date();
  console.log(`有人訪問 在${current}`);
  // 讓他往下  必寫
  next();
});

// stock 相關路由
let stockRouter = require("./routes/stock")
// 第一個參數為路徑  
app.use("/stock", stockRouter);

// 路由

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/about", function (req, res) {
  res.render("about");
});
// app.get("/stock", async (req, res) => {
//   let queryResults = await connection.queryAsync("SELECT * FROM stock");
// //   console.log(stocks);
//   res.render("stock/list", {
//       stocks: queryResults
//   });
// });
// app.get("/stock/:stockId", async (req,res) =>{
//   let queryResults = await connection.queryAsync("SELECT * FROM stock_price WHERE stock_id = ? ORDER BY date", req.params.stockId);
//   res.render("stock/detail", {
//     stockPrices: queryResults
// });
// })

app.listen(3000, async () => {
  await connection.connectAsync();
  console.log(`跑起來了 在port 3000`);
});
