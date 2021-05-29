
var axios = require('axios');

axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY?', {
    params: {
        response:'json',
        date:'20210523',
        stockNo:'2610',
    }
  })
  .then(function (response) {
    let result = response.data;
    console.log(result.date);
    console.log(result.title);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  

