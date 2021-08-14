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

const userRouter = require("../api/user/user-router");
const ingredientListRouter = require("../api/ingredient-list/ingredient-list-router");
const ingredientRouter = require("../api/ingredient/ingredient-router");

server.use("/user", userRouter);
server.use("/ingredient-list", ingredientListRouter);
server.use("/ingredient", ingredientRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
