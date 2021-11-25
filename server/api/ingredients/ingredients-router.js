const router = require("express").Router();
const { validateRecipeById } = require("../recipes/recipes-middleware");
const { validateRecipe, validateIngredient } = require("./ingredients-middleware");
const Ingredients = require("./ingredients-model");

router.get("/", (_req, res) => {
  Ingredients.findIngredients()
    .then((ingredients) => {
      res.status(200).json({ ingredients });
    })
    .catch(() => {
      res.status(400).json("Ingredients not found");
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  Ingredients.findIngredientById(id)
    .then((ingredient) => {
      res.status(200).json({ ingredient });
    })
    .catch(() => {
      res.status(400).json("Ingredients not found");
    });
});

router.post("/", validateRecipe, (req, res) => {
  const body = req.body;
  Ingredients.addNewIngredients(body)
    .then((ingredients) => {
      res
        .status(201)
        .json({ message: `successfully added ${body.length} new ingredients`, ingredients });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.put("/:id", validateIngredient, (req, res) => {
  const { id } = req.params;
  const { body } = req;

  Ingredients.updateIngredient(id, body)
    .then((updatedIngredient) => {
      res
        .status(201)
        .json({ message: `successfully updated ingredient with the id: ${id}`, updatedIngredient });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.delete("/:id", validateIngredient, (req, res) => {
  const { id } = req.params;

  Ingredients.deleteIngredientById(id)
    .then((deletedIngredient) => {
      res.status(200).json({ deletedIngredient });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.delete("/recipe/:id", validateRecipeById, (req, res) => {
  const { id } = req.params;

  Ingredients.deleteIngredientsByRecipeId(id)
    .then((deletedIngredient) => {
      res.status(200).json({ deletedIngredient });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.put("/recipe/:id", validateRecipeById, (req, res) => {
  const { id } = req.params;
  const { body } = req;

  Ingredients.updateIngredientsByRecipe(id, body).then((updatedIngredients) => {
    res
      .status(200)
      .json({ message: "Updated ingredients with recipe id: " + id, updatedIngredients });
  });
});

router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { body } = req;
  Ingredients.updateIsChecked(id, body)
    .then((update) => {
      res.status(200).json({ message: "Updated ingredients with id: " + id, update });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


module.exports = router;
