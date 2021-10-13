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
          description: "chop everything",
          step: 1
        },
        {
          id: 2,
          "recipe-id": 4,
          description: "If cooking black lentils and basmati rice, start them first",
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
        },
        {
          id: 7,
          "recipe-id": 5,
          description: "Toast slices of bread",
          step: 1
        },
        {
          id: 8,
          "recipe-id": 5,
          description: 'While bread is toasting to desired color, cut up banana in 1/4" slices',
          step: 2
        },
        {
          id: 9,
          "recipe-id": 5,
          description: "Spread jam on one slice of bread, and peanut butter on the other slice",
          step: 3
        },
        {
          id: 10,
          "recipe-id": 5,
          description:
            "Lay out banana slices on one half of bread. Close up that bad boy and you got yourself a dank PB&J",
          step: 4
        },
        {
          id: 11,
          "recipe-id": 6,
          description: "Test 1",
          step: 1
        },
        {
          id: 12,
          "recipe-id": 6,
          description: "Test 2",
          step: 2
        },
        {
          id: 13,
          "recipe-id": 6,
          description: "Test 3",
          step: 3
        },
        {
          id: 14,
          "recipe-id": 3,
          description: "Don't do anything",
          step: 1
        }
      ]);
    });
};
