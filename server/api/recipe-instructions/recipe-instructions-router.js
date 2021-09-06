const router = require("express").Router();

const { validateRecipe } = require("../ingredients/ingredients-middleware");
const { validateRecipeById } = require("../recipes/recipes-middleware");
const RecipeInstructions = require("./recipe-instructions-model");

router.get("/", (_req, res) => {
  RecipeInstructions.findInstructions()
    .then((instructions) => {
      res.status(200).json({ instructions });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.get("/:recipeId", (req, res) => {
  const { recipeId } = req.params;
  RecipeInstructions.findInstructionsByRecipeId(recipeId)
    .then((recipeInstructions) => {
      res.status(200).json({ recipeInstructions });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.post("/", validateRecipe, (req, res) => {
  const { body } = req;
  const id = body[0]["recipe-id"];

  RecipeInstructions.addInstructions(body)
    .then((newInstructions) => {
      res
        .status(201)
        .json({ message: `instructions for recipe with id: ${id} added`, newInstructions });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.put("/:id", validateRecipeById, (req, res) => {
  const { id } = req.params;
  const { body } = req;
  RecipeInstructions.updateInstructions(id, body)
    .then((updatedRecipe) => {
      res
        .status(200)
        .json({ message: `Successfully updated recipe with id: ${id}`, updatedRecipe });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete("/:id", validateRecipeById, (req, res) => {
  const { id } = req.params;

  RecipeInstructions.deleteInstructionsByRecipeid(id)
    .then((deletedInstructions) => {
      res.status(200).json({ deletedInstructions });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
