require("dotenv").config();
const chalk = require("chalk");

const server = require("./api/server");

const PORT = process.env.PORT;
server.listen(PORT, () =>
  console.log(`/n** Running on port ${chalk.green(PORT)} **/n`)
);
