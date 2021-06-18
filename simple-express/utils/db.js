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

  module.exports = connection;

  

