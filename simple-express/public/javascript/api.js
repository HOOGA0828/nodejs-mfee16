

$(function() {
//  ajax取得資料
    $.ajax({
        type: "GET",
        url: "/api/stocks"
    }).done(function(data) {
        console.log(data)
    });

//  axios取得資料
axios
    .get("/api/stocks")
    .then(function (rep) {
        console.log(rep.data)
    })

//  fetch取得資料
fetch("/api/stocks")
    .then((res) => {
        return res.json
    })
    .then((data) => {
        console.log(data);
    });
})
