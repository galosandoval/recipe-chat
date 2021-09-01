const router = require("express").Router();
const { validateUser } = require("../users/users-middleware");
const Recipes = require("./recipes-model");

router.get("/", (req, res) => {
  Recipes.findRecipes()
    .then((allRecipes) => {
      res.status(200).json({ allRecipes });
    })
    .catch((err) => {
      res.status(404).json("Ingredients not found");
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  Recipes.findIngredientsByRecipeId(id)
    .then((recipeIngredients) => {
      res.status(200).json({ recipeIngredients });
    })
    .catch((err) => {
      res.status(404).json("IngredientList not found with id " + id, err);
    });
});

router.get("/user/:id", (req, res) => {
  const { id } = req.params;
  Recipes.findRecipesByUserId(id)
    .then((recipes) => {
      res.status(200).json({ recipes });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post("/", validateUser, (req, res) => {
  const body = req.body;

  Recipes.addRecipe(body)
    .then((recipe) => {
      res.status(201).json({ recipe });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { body } = req;

  const now = new Date();
  const date = now.getDate();
  console.log("length", date.toString());
  const month = now.getMonth();
  console.log("month", month.toString().length);
  const year = now.getFullYear();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const secs = now.getSeconds();
  //  "created_at": "2021-09-01 01:59:51"

  const addZero = (date) => (date.toString().length < 2 ? "0" + date : date);

  body["updated_at"] = `${year}-${addZero(month)}-${addZero(date)} ${addZero(hours)}:${addZero(
    minutes
  )}:${addZero(secs)}`;

  Recipes.updateRecipe(id, body)
    .then((recipe) => {
      res.status(200).json({ recipe });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
