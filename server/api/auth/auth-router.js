const router = require("express").Router();

router.post("/register", (req, res) => {
  const creds = req.body;

  console.log({ creds });

  res.json({ status: "ok" });
});

module.exports = router;
