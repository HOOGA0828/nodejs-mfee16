const connection = require("./utils/db");
require("dotenv").config();
const express = require("express");

let app = express();

var multer = require('multer');
var upload = multer();
//中間件

app.use(express.urlencoded({extended: false})); //加上這個中間件，就可以解讀POST過來的資料
app.use(express.json());
// 想要拿到 cookie
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// 想要可以處理session
const expressSession = require("express-session");

app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false

}))
app.use(express.static("public"));

// 第一個是變數
// 第二個是檔案名稱
app.set("views", "views");
// 告訴 express 我們用的是 view engine 是 pug
app.set("view engine", "pug");

// 把 req.session 設定給 res.locals
app.use(function (req, res, next){
  // 把request 的 session 資料設定給 res 的 locals
  // views 就可以取得資料
  res.locals.member = req.session.member;
  next()
})
// 處理登入訊息
app.use(function (req, res, next){
  // 因為訊息只想被顯示一次
  // 所以傳道 views 後就刪除
  if(req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }
  next();
})

app.use(function (req, res, next) {
  let current = new Date();
  console.log(`有人訪問 在${current}`);
  // 讓他往下  必寫
  next();
});

// stock 相關路由
let stockRouter = require("./routes/stock");
// 第一個參數為路徑
app.use("/stock", stockRouter);

let apiRouter = require("./routes/api");
app.use("/api", apiRouter);

let authRouter = require("./routes/auth");
app.use("/auth", authRouter);

let memberRouter = require("./routes/member");
app.use("/member", memberRouter)
// 路由

app.get("/", function (req, res) {
  res.cookie("lang", "zh-TW")
  res.render("index");
});
app.get("/about", function (req, res) {
  res.render("about");
});

//  放在所有路由下面
app.use(function (req, res, next) {
  // 表示前面的路由都找不到
  //  http status code: 404
  res.status(404);
  res.render("404");
});

// 500 error
// 放在所有路由後面
// 這裡一定有四個參數-->最後的錯誤處理
app.use(function (err, req, res, next) {
  console.log(err.message);
  res.status(500);
  res.send("500 - 伺服器錯誤喔XD");
});

app.listen(3000, async () => {
  await connection.connectAsync();
  console.log(`跑起來了 在port 3000`);
});
