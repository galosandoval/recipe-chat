exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("recipe-instructions")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("recipe-instructions").insert([
        {
          id: 1,
          "recipe-id": 1,
          description:
            "Make the Mushrooms: Heat a large skillet over medium-high heat and melt butter. Once melted, add mushrooms (working in batches if needed to not overcrowd the pan), garlic and thyme and cook, tossing occasionally, until mushrooms are lightly browned and tender. If working in batches, remove mushrooms from skillet and set aside, keeping the garlic and thyme in the pan and add a bit more butter to the pan, and repeat with remaining mushrooms.",
          step: 1
        },
        {
          id: 2,
          "recipe-id": 1,
          description:
            "Add shallots, season everything with salt and pepper, and saute for 1-2 minutes, until shallots are tender and fragrant. Discard garlic and thyme, then add a splash of sherry vinegar, crème fraîche then stir to combine. Reduce heat to medium low and let simmer all together for a moment. Taste and adjust seasoning before removing from heat. ",
          step: 2
        },
        {
          id: 3,
          "recipe-id": 1,
          description:
            "Place a few generous spoonfuls of mushrooms and sauce on top of toasted bread, then top with arugula leaves. Nestle the eggs atop the greens and top with shaves of Gruyère.",
          step: 3
        },

        {
          id: 4,
          "recipe-id": 2,
          description:
            "In a small pot, simmer heavy cream, milk, sugar and salt until sugar completely dissolves, about 5 minutes. Remove pot from heat. In a separate bowl, whisk yolks. Whisking constantly, slowly whisk about a third of the hot cream into the yolks, then whisk the yolk mixture back into the pot with the cream. Return pot to medium-low heat and gently cook until mixture is thick enough to coat the back of a spoon (about 170 degrees on an instant-read thermometer).",
          step: 1
        },
        {
          id: 5,
          "recipe-id": 2,
          description:
            "Strain through a fine-mesh sieve into a bowl. Cool mixture to room temperature. Cover and chill at least 4 hours or overnight. Churn in an ice cream machine according to manufacturers’ instructions. Serve directly from the machine for soft serve, or store in freezer until needed.",
          step: 2
        },
        {
          id: 6,
          "recipe-id": 3,
          description: "If cooking black lentils and basmati rice, start them first",
          step: 1
        },
        {
          id: 7,
          "recipe-id": 3,
          description:
            "Make the Spinach Sauce: Sautee the onion in ghee, in a large pan, over medium heat for 3-4 minutes, then add garlic, ginger and chilies. Saute until fragrant and golden. Add the fennel seeds, mustard seeds, cumin seeds and garam masala and stir two minutes. Lower heat to low. Add the fresh spinach, mint, fenugreek and water. Cover pan, 2-3 minutes, letting spinach wilt. Give a few stirs. Don’t overcook!",
          step: 2
        },
        {
          id: 8,
          "recipe-id": 3,
          description:
            "Blend Spinach Sauce: Place the wilted spinach mixture in a blender and add the 3/4 cups water. Pulse and few times (hold lid down tight). If you want a smooth sauce, blend until smooth. I left a little texture here.  Pour it back into the pan, set on low heat. Don’t overheat or you will lose the pretty color.",
          step: 3
        },
        {
          id: 9,
          "recipe-id": 3,
          description:
            "Combine: Stir in the yogurt, lentils and salt. Taste. Adjust salt to your liking, adding more if necessary! You want this slightly more salty because you are serving over rice which will mellow it out a lot. For more heat add a pinch of cayenne or chili flakes. To “up” the flavor even more, add a bit more garam masala spice to taste. If you want a little acidity a tiny squeeze of lemon is nice.",
          step: 4
        },
        {
          id: 10,
          "recipe-id": 3,
          description: "Serve with the basmati rice and naan bread!",
          step: 5
        },
        {
          id: 11,
          "recipe-id": 4,
          description: "Toast slices of bread",
          step: 1
        },
        {
          id: 12,
          "recipe-id": 4,
          description: 'While bread is toasting to desired color, cut up banana in 1/4" slices',
          step: 2
        },
        {
          id: 13,
          "recipe-id": 4,
          description: "Spread jam on one slice of bread, and peanut butter on the other slice",
          step: 3
        },
        {
          id: 14,
          "recipe-id": 4,
          description:
            "Lay out banana slices on one half of bread. Close up that bad boy and you got yourself a dank PB&J",
          step: 4
        }
      ]);
    });
};
