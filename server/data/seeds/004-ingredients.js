exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("ingredients")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("ingredients").insert([
        {
          id: 1,
          name: "1 cup of chopped onions",
          "recipe-id": 1
        },
        {
          id: 2,
          name: "1 cup of chopped red bellpepper",
          "recipe-id": 1
        },
        {
          id: 3,
          name: "3 cloves of minced garlic",
          "recipe-id": 1
        },
        {
          id: 4,
          name: "2 eggs",
          "recipe-id": 2
        },
        {
          id: 5,
          name: "half a cup of onions",
          "recipe-id": 3
        },
        {
          id: 6,
          name: "3 Tbls ghee",
          "recipe-id": 4
        },
        {
          id: 7,
          name: "1 large onion diced",
          "recipe-id": 4
        },
        {
          id: 8,
          name: "4 cloves roughly chopped",
          "recipe-id": 4
        },
        {
          id: 9,
          name: "2 tbls ginger finely chopped",
          "recipe-id": 4
        },
        {
          id: 10,
          name: "1 medium jalapeno finely chopped",
          "recipe-id": 4
        },
        {
          id: 11,
          name: "1/2 tsp fennel seeds",
          "recipe-id": 4
        },
        {
          id: 12,
          name: "1 tsp black mustard seeds",
          "recipe-id": 4
        },
        {
          id: 13,
          name: "2 tsp cumin seeds",
          "recipe-id": 4
        },
        {
          id: 14,
          name: "2 tsp garam masala",
          "recipe-id": 4
        },
        {
          id: 15,
          name: "1 lb baby spinach (fresh or frozen)",
          "recipe-id": 4
        },
        {
          id: 16,
          name: "15 fresh mint leaves",
          "recipe-id": 4
        },
        {
          id: 17,
          name: "1 tsp dried fenugreek leaves",
          "recipe-id": 4
        },
        {
          id: 18,
          name: "2 tbls water (if using fresh spinach)",
          "recipe-id": 4
        },
        {
          id: 19,
          name: "3/4 cups water",
          "recipe-id": 4
        },
        {
          id: 20,
          name: "1/2 cup plain yogurt (or vegan yogurt)",
          "recipe-id": 4
        },
        {
          id: 21,
          name: "3 cups cooked black lentils",
          "recipe-id": 4
        },
        {
          id: 22,
          name: "1 tsp salt, more to taste!",
          "recipe-id": 4
        },
        {
          id: 23,
          name: "2 slices of bread",
          "recipe-id": 5
        },
        {
          id: 24,
          name: "2 tbls of your favorite jam",
          "recipe-id": 5
        },
        {
          id: 25,
          name: "2 tbls of your favorite peanut butter",
          "recipe-id": 5
        },
        {
          id: 26,
          name: "1 banana",
          "recipe-id": 5
        },
        { id: 27, name: "Test 1", "recipe-id": 6 },
        { id: 28, name: "Test 2", "recipe-id": 6 },
        { id: 29, name: "Test 3", "recipe-id": 6 }
      ]);
    });
};
