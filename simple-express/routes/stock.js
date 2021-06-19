const express = require("express");
const router = express.Router();

const connection = require("../utils/db");

router.get("/", async (req, res) => {
  let queryResults = await connection.queryAsync("SELECT * FROM stock");
  //   console.log(stocks);
  res.render("stock/list", {
    stocks: queryResults,
  });
});
router.get("/:stockId", async (req, res) => {
  let queryResults = await connection.queryAsync(
    "SELECT * FROM stock_price WHERE stock_id = ? ORDER BY date",
    req.params.stockId
  );
  res.render("stock/detail", {
    stockPrices: queryResults,
  });
});

module.exports = router;
