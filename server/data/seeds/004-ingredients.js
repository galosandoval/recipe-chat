exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("ingredients")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("ingredients").insert([
        {
          id: 1,
          name: "2 tablespoons unsalted butter, more as needed",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 2,
          name: "Olive oil",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 3,
          name: "2/3 cup sugar",
          "recipe-id": 2,
          isChecked: 0
        },
        {
          id: 4,
          name: "8 ounces mushrooms, ends trimmed and sliced into even pieces",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 5,
          name: "3 cloves garlic, smashed",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 6,
          name: "½ shallot, finely minced, about 2 tablespoons",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 7,
          name: "Kosher salt",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 8,
          name: "Freshly ground black pepper",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 9,
          name: "Sherry vinegar",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 10,
          name: "3 tablespoons crème fraîche",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 11,
          name: "2 thick slices sourdough or country bread, toasted in a pan with butter",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 12,
          name: "Handful of arugula, tossed with olive oil, lemon juice and salt",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 13,
          name: "2 soft-poached eggs, topped with flaky salt and black pepper",
          "recipe-id": 1,
          isChecked: 0
        },
        {
          id: 14,
          name: "Gruyère cheese, shaved",
          "recipe-id": 1,
          isChecked: 0
        },

        {
          id: 15,
          name: "2 cups heavy cream",
          "recipe-id": 2,
          isChecked: 0
        },
        {
          id: 16,
          name: "6 large egg yolks",
          "recipe-id": 2,
          isChecked: 0
        },
        {
          id: 17,
          name: "1 cup whole milk",
          "recipe-id": 2,
          isChecked: 0
        },
        {
          id: 18,
          name: "1/8 teaspoon fine sea salt",
          "recipe-id": 2,
          isChecked: 0
        },
        {
          id: 19,
          name: "Your choice of flavoring ",
          "recipe-id": 2,
          isChecked: 0
        },

        {
          id: 20,
          name: "3 Tbls ghee",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 21,
          name: "1 large onion diced",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 22,
          name: "4 cloves roughly chopped",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 23,
          name: "2 tbls ginger finely chopped",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 24,
          name: "1 medium jalapeno finely chopped",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 25,
          name: "1/2 tsp fennel seeds",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 26,
          name: "1 tsp black mustard seeds",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 27,
          name: "2 tsp cumin seeds",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 28,
          name: "2 tsp garam masala",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 29,
          name: "1 lb baby spinach (fresh or frozen)",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 30,
          name: "15 fresh mint leaves",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 31,
          name: "1 tsp dried fenugreek leaves",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 32,
          name: "2 tbls water (if using fresh spinach)",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 33,
          name: "3/4 cups water",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 34,
          name: "1/2 cup plain yogurt (or vegan yogurt)",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 35,
          name: "3 cups cooked black lentils",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 36,
          name: "1 tsp salt, more to taste!",
          "recipe-id": 3,
          isChecked: 0
        },
        {
          id: 37,
          name: "2 slices of bread",
          "recipe-id": 4,
          isChecked: 0
        },
        {
          id: 38,
          name: "2 tbls of your favorite jam",
          "recipe-id": 4,
          isChecked: 0
        },
        {
          id: 39,
          name: "2 tbls of your favorite peanut butter",
          "recipe-id": 4,
          isChecked: 0
        },
        {
          id: 40,
          name: "1 banana",
          "recipe-id": 4,
          isChecked: 0
        }
      ]);
    });
};
