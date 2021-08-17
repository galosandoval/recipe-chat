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

const usersRouter = require("./users/users-router");
const recipesRouter = require("./recipes/recipes-router");
const ingredientsRouter = require("./ingredients/ingredients-router");
const recipeInstructionsRouter = require("./recipe-instructions/recipe-instructions-router");
const groceryListRouter = require("./grocery-lists/grocery-lists-router");

server.use("/users", usersRouter);
server.use("/recipes", recipesRouter);
server.use("/ingredients", ingredientsRouter);
server.use("/instructions", recipeInstructionsRouter);
server.use("/grocery-lists", groceryListRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
