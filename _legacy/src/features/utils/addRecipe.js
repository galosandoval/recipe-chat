export const parseInstructions = (string) => {
  let instructionsBody = string.split(" ");
  let instructions = [];
  let instruction = "";
  let count = 0;

  for (let i = 0; i < instructionsBody.length + count; i++) {
    // i is each word
    if (instructionsBody[i]?.includes("\n")) {
      let toAdd = instructionsBody[i].split("\n");

      if (toAdd[0] === "" && toAdd.length > 2) {
        instructions.push(instruction);
        instruction = toAdd[2] + " ";
        count++;
        continue;
      } else if (toAdd.length > 2) {
        toAdd = toAdd.filter(Boolean);
      }

      instruction += toAdd[0];
      if (instruction.length > 10) {
        instructions.push(instruction);
      }

      instruction = toAdd[1] + " ";
      count++;
      continue;
    }
    if (instructionsBody[i] !== undefined) {
      instruction += instructionsBody[i] + " ";
    }

    // At the end of array
    if (instructionsBody.length === i) instructions.push(instruction);
  }
  return instructions;
};

export const parseIngredients = (string) => {
  let ingredientsBody = string.split(" ");
  let ingredient = "";
  let ingredients = [];
  let count = 0;
  for (let i = 0; i < ingredientsBody.length + count; i++) {
    if (ingredientsBody[i]?.includes("\n")) {
      let toAdd = ingredientsBody[i].split("\n");
      if (toAdd.length > 2) toAdd = toAdd.filter(Boolean);
      if (toAdd.length === 2) {
        ingredient += toAdd[0] + " ";
        if (ingredient.length < 3) {
          ingredient += toAdd[1] + " ";
          continue;
        }
        ingredients.push(ingredient.trim());
        ingredient = "";
        ingredient += toAdd[1] + " ";
        count++;
        continue;
      }
      if (toAdd.length === 3) ingredient += toAdd[0] + " ";
      ingredients.push(ingredient.trim());
      ingredient = "";
      ingredient += toAdd[1] + " " + toAdd[2] + " ";
      count++;
      continue;
    }
    if (ingredientsBody[i] !== undefined) ingredient += ingredientsBody[i] + " ";
    if (ingredientsBody.length === i) ingredients.push(ingredient.trim());
  }
  return ingredients;
};
