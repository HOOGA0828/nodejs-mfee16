const express = require("express");

let app = express();

//中間件
app.use(function (req, res, next){
    let current = new Date();
    console.log(`有人訪問 在${current}`);
    // 讓他往下  必寫
    next();
})

// 路由
app.get("/", function(req,res){
    res.send("hello express")
});
app.get("/about", function(req,res){
    res.send("這是about")
});

app.listen(3000, () =>{
    console.log(`跑起來了 在port 3000`);
})