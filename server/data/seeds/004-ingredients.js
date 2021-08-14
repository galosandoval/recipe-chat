exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("ingredients")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("ingredients").insert([
        {
          id: 1,
          name: "onion",
          price: 100,
          measurement: "cups",
          amount: 0.5,
          "recipe-id": 1
        },
        {
          id: 2,
          name: "red bellpepper",
          price: 50,
          measurement: "cups",
          amount: 0.5,
          "recipe-id": 1
        },
        {
          id: 3,
          name: "garlic",
          price: 100,
          measurement: "cloves",
          amount: 3,
          "recipe-id": 1
        },
        {
          id: 4,
          name: "eggs",
          price: 50,
          measurement: "each",
          amount: 6,
          "recipe-id": 2
        },
        {
          id: 5,
          name: "onion",
          price: 100,
          measurement: "cups",
          amount: 0.5,
          "recipe-id": 3
        },
        {
          id: 6,
          name: "ghee",
          price: 300,
          measurement: "tablespoons",
          amount: 3,
          "recipe-id": 4
        },
        {
          id: 7,
          name: "large onion",
          price: 50,
          measurement: "each",
          amount: 1,
          "recipe-id": 4,
          cutsize: "diced"
        },
        {
          id: 8,
          name: "cloves",
          price: 20,
          measurement: "each",
          amount: 4,
          "recipe-id": 4,
          cutsize: "rough chopped"
        },
        {
          id: 9,
          name: "ginger",
          price: 10,
          measurement: "tablespoons",
          amount: 2,
          "recipe-id": 4,
          cutsize: "finely chopped"
        },
        {
          id: 10,
          name: "medium jalapeno",
          price: 100,
          measurement: "each",
          amount: 1,
          "recipe-id": 4,
          cutsize: "finely chopped"
        },
        {
          id: 11,
          name: "fennel seeds",
          price: 100,
          measurement: "teaspoon",
          amount: 0.5,
          "recipe-id": 4
        },
        {
          id: 12,
          name: "black mustard seeds",
          price: 100,
          measurement: "teaspoon",
          amount: 1,
          "recipe-id": 4
        },
        {
          id: 13,
          name: "cumin seeds",
          price: 100,
          measurement: "teaspoons",
          amount: 2,
          "recipe-id": 4
        },
        {
          id: 14,
          name: "garam masala",
          price: 100,
          measurement: "teaspoons",
          amount: 2,
          "recipe-id": 4
        },
        {
          id: 15,
          name: "baby spinach (fresh or frozen)",
          price: 100,
          measurement: "lb",
          amount: 1,
          "recipe-id": 4
        },
        {
          id: 16,
          name: "fresh mint leaves",
          price: 100,
          measurement: "each",
          amount: 15,
          "recipe-id": 4
        },
        {
          id: 17,
          name: "dried fenugreek leaves",
          price: 100,
          measurement: "teaspoon",
          amount: 1,
          "recipe-id": 4
        },
        {
          id: 18,
          name: "water (if using fresh spinach)",
          price: 100,
          measurement: "tablespoons",
          amount: 2,
          "recipe-id": 4
        },
        {
          id: 19,
          name: "water",
          price: 100,
          measurement: "cup",
          amount: 0.75,
          "recipe-id": 4
        },
        {
          id: 20,
          name: "plain yogurt (or vegan yogurt)",
          price: 100,
          measurement: "cup",
          amount: 0.5,
          "recipe-id": 4
        },
        {
          id: 21,
          name: "cooked black lentils",
          price: 100,
          measurement: "cups",
          amount: 3,
          "recipe-id": 4
        },
        {
          id: 22,
          name: "salt, more to taste!",
          price: 100,
          measurement: "teaspoon",
          amount: 1,
          "recipe-id": 4
        }
      ]);
    });
};
