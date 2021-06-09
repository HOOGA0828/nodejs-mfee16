const http = require("http");
const { URL } = require("url");
const fs = require("fs/promises")

const server = http.createServer(async(req, res) => {
    console.log("有人連線")
    console.log(req.url)

    // 將url一般化
    const path = req.url.replace(/\/?(?:\?.*)?$/, "").toLocaleLowerCase();
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(url.searchParams);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain;charset=UTF-8")

    switch(path){
        case "/":
            res.end("這是首頁");
            break
        case "/test":
            res.setHeader("content-type", "text/html;charset=UTF-8")
            let content = await fs.readFile("test.html")
            res.end(content);
            break
        case "/about":
            let name = url.searchParams.get("name") || "吃瓜群眾";
            res.end(`關於${name}的故事`);
            break    
        default:
            res.writeHead(404);
            res.end("not found");
    }
});


server.listen(3000, () =>{
    console.log("接收中")
})