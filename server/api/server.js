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
const recipesGroceryListsRouter = require("./recipes-grocery-lists/recipes-grocery-lists-router");
const authRouter = require("./auth/auth-router");
const requiresToken = require("./auth/restricted-middleware");

server.use("/users", requiresToken, usersRouter);
server.use("/recipes", requiresToken, recipesRouter);
server.use("/ingredients", requiresToken, ingredientsRouter);
server.use("/instructions", requiresToken, recipeInstructionsRouter);
server.use("/grocery-lists", requiresToken, groceryListRouter);
server.use("/recipes-grocery-lists", requiresToken, recipesGroceryListsRouter);
server.use("/auth", authRouter);

server.get("/", (_req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
