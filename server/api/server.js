const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const server = express();

server.use(helmet());
server.use(express.json());
server.use(morgan("tiny"));
server.use(
  cors({
    origin: "*",
    credentials: true
  })
);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
