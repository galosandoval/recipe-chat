exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("recipe-instructions")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("recipe-instructions").insert([
        {
          id: 1,
          "recipe-id": 1,
          description: "chop everything",
          step: 1
        },
        {
          id: 2,
          "recipe-id": 4,
          description:
            "If cooking black lentils and basmati rice, start them first",
          step: 1
        },
        {
          id: 3,
          "recipe-id": 4,
          description:
            "Make the Spinach Sauce: Sautee the onion in ghee, in a large pan, over medium heat for 3-4 minutes, then add garlic, ginger and chilies. Saute until fragrant and golden. Add the fennel seeds, mustard seeds, cumin seeds and garam masala and stir two minutes. Lower heat to low. Add the fresh spinach, mint, fenugreek and water. Cover pan, 2-3 minutes, letting spinach wilt. Give a few stirs. Don’t overcook!",
          step: 2
        },
        {
          id: 4,
          "recipe-id": 4,
          description:
            "Blend Spinach Sauce: Place the wilted spinach mixture in a blender and add the 3/4 cups water. Pulse and few times (hold lid down tight). If you want a smooth sauce, blend until smooth. I left a little texture here.  Pour it back into the pan, set on low heat. Don’t overheat or you will lose the pretty color.",
          step: 3
        },
        {
          id: 5,
          "recipe-id": 4,
          description:
            "Combine: Stir in the yogurt, lentils and salt. Taste. Adjust salt to your liking, adding more if necessary! You want this slightly more salty because you are serving over rice which will mellow it out a lot. For more heat add a pinch of cayenne or chili flakes. To “up” the flavor even more, add a bit more garam masala spice to taste. If you want a little acidity a tiny squeeze of lemon is nice.",
          step: 4
        },
        {
          id: 6,
          "recipe-id": 4,
          description: "Serve with the basmati rice and naan bread!",
          step: 5
        }
      ]);
    });
};
