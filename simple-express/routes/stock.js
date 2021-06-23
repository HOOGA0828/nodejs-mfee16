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
router.get("/:stockId", async (req, res, next) => {
  let queryResultsStocks = await connection.queryAsync(
    "SELECT * FROM stock WHERE stock_id = ?",
    req.params.stockId
  );

  if (queryResultsStocks.length === 0) {
    next();
  }

  queryResultsStocks = queryResultsStocks[0];

  let count = await connection.queryAsync(
    "SELECT COUNT(*) as total FROM stock_price WHERE stock_id = ?",
    req.params.stockId
  );
  // console.log(count)
  const total = count[0].total; //總共幾筆
  const perPage = 5; // 一頁5筆
  const lastPage = Math.ceil(total / perPage); // 總共幾頁
  // console.log(lastPage)

  const currentPage = req.query.page || 1; //現在第幾頁
  const offset = (currentPage - 1) * perPage;

  let queryPrice = await connection.queryAsync(
    "SELECT * FROM stock_price WHERE stock_id = ? ORDER BY date LIMIT ? OFFSET ?",
    [req.params.stockId, perPage, offset]
  );

  res.render("stock/detail", {
    queryResultsStocks,
    stockPrices: queryPrice,
    pagination: {
      lastPage,
      currentPage,
      total,
    },
  });
});

module.exports = router;
