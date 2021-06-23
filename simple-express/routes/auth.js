const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const bcrypt = require("bcrypt");

const { body, validationResult } = require("express-validator");

const path = require("path");
const multer = require("multer");
const { errorMonitor } = require("events");
//設定上傳檔案格式
const myStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 希望找到的位置 public/uploads
    cb(null, path.join(__dirname, "../", "public", "uploads"));
  },
  filename: function (req, file, cb) {
    // 抓出副檔名
    const ext = file.originalname.split(".").pop();
    // 組合出想要的檔案名稱
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});
// 要用 multer 做一個上傳工具
const uploader = multer({
  storage: myStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "image/jpeg") {
      return cb(new errorMonitor("不合法的 file type"), false);
    }
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("不合格的附檔名"));
    }
    // 檔案OK 接受這個檔案
    cb(null, true);
  },
  limits: {
    // 1M
    fileSize: 1024 * 1024,
  },
});

router.get("/register", (req, res) => {
  res.render("auth/register");
});
// 註冊表單的驗證規則
const registerRules = [
  body("email").isEmail().withMessage("請正確輸入 Email 格式"),
  body("password").isLength({ min: 6 }),
  body("confirmPassword").custom((value, { req }) => {
    return value === req.body.password;
  }),
];

router.post(
  "/register",
  uploader.single("photos"),
  registerRules,
  async (req, res, next) => {
    // console.log(req.body);
    //後端要自己做驗證
    const validateResult = validationResult(req);
    if (!validateResult.isEmpty()) {
      //不是空的，就是有問題
      return next(new Error("註冊表單有問題"));
    }

    //   先檢查這個 email 是否已經註冊過
    let checkResult = await connection.queryAsync(
      "SELECT * FROM members WHERE email = ?",
      req.body.email
    );
    if (checkResult.length > 0) {
      return next(new Error("已經註冊過"));
    }
    //如果沒有註冊過，就儲存資料

    //  取得到的資料型態 (req.file)
    //    fieldname: 'photos',
    //   originalname: 'pee.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg',
    //   destination: 'C:\\Users\\joe\\node-meff16\\simple-express\\public\\uploads',
    //   filename: 'photos-1624364644382.jpg',
    //   path: 'C:\\Users\\joe\\node-meff16\\simple-express\\public\\uploads\\photos-1624364644382.jpg',
    //   size: 16016

    // 檢查有沒有圖片，有圖片才抓
    let filepath = req.file ? "/uploads" + req.file.filename : null;

    let result = await connection.queryAsync(
      "INSERT INTO members (email, password, name, photo) VALUES (?)",
      [
        [
          req.body.email,
          await bcrypt.hash(req.body.password, 10),
          req.body.name,
          filepath,
        ],
      ]
    );

    res.send("恭喜註冊成功!!");
  }
);

router.get("/login", (req, res) => {
  if(req.session.member){
    req.session.message = {
      title: "重複登入",
      text: "你已經登入成功"
    };
    return res.redirect(303, "/login");
  }

  res.render("auth/login");
});
// 登入
const loginRules = [
    body("email").isEmail().withMessage("請正確輸入 Email 格式"),
    body("password").isLength({ min: 6 }),
];
router.post("/login", loginRules, async(req, res, next) => {

    // console.log(req.body)

    const validateResult = validationResult(req);
    if (!validateResult.isEmpty()) {
      //不是空的，就是有問題
      return next(new Error("登入有問題123"));
    }

    // 檢查這個email在不在
    let member = await connection.queryAsync(
      "SELECT * FROM members WHERE email = ?",
      req.body.email
    );
    if (member.length === 0) {
      return next(new Error("查無此帳號"));
    }
    member = member[0];

    // 比對密碼
    // hash("Test") -> 結果每次都一樣
    // bcrypt 每次加密結果不一樣，因此使用提供的比對函式

    let result = await bcrypt.compare(req.body.password, member.password);
    if(result){
      req.session.member = {
        email: member.email,
        name: member.name,
        photo: member.photo,
      };

      // 處理訊息
      req.session.message = {
        title: "登入成功",
        text: "歡迎回到本服務"
      }
      // status code
      // 跳到首頁
      res.redirect(303, "/");
    }else{
      req.session.member = null;
      // 處理訊息
      req.session.message = {
        title: "登入失敗",
        text: "請填寫正確資料"
      }
      // 轉跳到登入頁面
      res.redirect(303 , "auth/login");
    }
  });

router.get("/logout", (req, res) => {
  req.session.member = null;
   // 處理訊息
   req.session.message = {
    title: "以登出",
    text: "歡迎再回來"
  }
  res.redirect(303, "/")
})
module.exports = router;
