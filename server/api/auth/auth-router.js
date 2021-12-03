const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("../users/users-model");
const { validateBody } = require("./auth-middleware");
const jwt = require("jsonwebtoken");
const data = require("../../data/seed-data");
const db = require("../../data/connection");

router.post("/register", validateBody, async (req, res) => {
  const { username, password: plainPassword } = req.body;

  try {
    const password = bcryptjs.hashSync(plainPassword);
    const addedUser = await Users.addUser({ username, password });
    const token = makeJwt(addedUser[0]);

    // const recipesToAdd = data.recipes;
    // recipesToAdd.forEach((recipe) => (recipe["user-id"] = addedUser[0].id));
    // const grocerylistsToAdd = data.grocerylists;
    // grocerylistsToAdd.forEach((gl) => (gl["user-id"] = addedUser[0].id));

    // const recipesAdded = await db("recipes").insert(recipesToAdd);
    // const grocerylistAdded = await db("grocery-lists").insert(grocerylistsToAdd);

    // const ingredientsToAdd = data.ingredients;
    // ingredientsToAdd.forEach((i, index) => {
    //   if (index < 14) i["recipe-id"] = recipesAdded[0] - 3;
    //   else if (index >= 14 && index < 19) i["recipe-id"] = recipesAdded[0] - 2;
    //   else if (index >= 19 && index < 36) i["recipe-id"] = recipesAdded[0] - 1;
    //   else i["recipe-id"] = recipesAdded[0];
    // });

    // const instructionsToAdd = data.instructions;
    // instructionsToAdd.forEach((i, index) => {
    //   if (index < 3) i["recipe-id"] = recipesAdded[0] - 3;
    //   else if (index >= 3 && index < 5) i["recipe-id"] = recipesAdded[0] - 2;
    //   else if (index >= 5 && index < 10) i["recipe-id"] = recipesAdded[0] - 1;
    //   else i["recipe-id"] = recipesAdded[0];
    // });

    // const recipesGrocerylistsToAdd = data.recipeGrocerylists;
    // recipesGrocerylistsToAdd.forEach((rgl, index) => {
    //   rgl["recipe-id"] = recipesAdded[0] - Math.floor(Math.random() * 4);

    //   if (index < 2) rgl["grocery-list-id"] = grocerylistAdded[0] - 3;
    //   else if (index >= 2 && index < 4) rgl["grocery-list-id"] = grocerylistAdded[0] - 2;
    //   else if (index >= 4 && index < 6) rgl["grocery-list-id"] = grocerylistAdded[0] - 1;
    //   else rgl["grocery-list-id"] = grocerylistAdded[0];

    //   rgl["user-id"] = addedUser[0].id;
    // });

    // await db("ingredients").insert(ingredientsToAdd);
    // await db("recipe-instructions").insert(instructionsToAdd);
    // await db("recipes-grocery-lists").insert(recipesGrocerylistsToAdd);


    res.status(201).json({ status: "ok", user: addedUser[0], token });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      // duplicate username

      return res.status(401).json({ status: "error", error: "Username already exists" });
    } else {
      // otherwise something else has gone wrong
      throw error;
    }
  }
});

router.post("/login", validateBody, async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findUserByUsername(username);

  if (user[0] && (await bcryptjs.compare(password, user[0].password))) {
    const token = makeJwt(user[0]);
    res.status(200).json({ status: "ok", user: user[0], token });
  } else {
    res.status(401).json({ status: "error", error: "Invalid username/password" });
  }
});

function makeJwt(user) {
  const payload = {
    id: user.id,
    username: user.username
  };

  const secret = process.env.JWT_TOKEN || "is it secret, is it safe?";

  const options = {
    expiresIn: "8h"
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
