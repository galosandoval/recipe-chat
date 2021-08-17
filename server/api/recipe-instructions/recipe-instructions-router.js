const router = require("express").Router();

const RecipeInstructions = require("./recipe-instructions-model");

router.get("/", (req, res) => {
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

module.exports = router;
