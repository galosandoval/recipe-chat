exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("ingredients")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("ingredients").insert([
        {
          id: 1,
          name: "1 cup of chopped onions",
          price: 100,
          "recipe-id": 1
        },
        {
          id: 2,
          name: "1 cup of chopped red bellpepper",
          price: 50,
          "recipe-id": 1
        },
        {
          id: 3,
          name: "3 cloves of minced garlic",
          price: 100,
          "recipe-id": 1
        },
        {
          id: 4,
          name: "2 eggs",
          price: 50,
          "recipe-id": 2
        },
        {
          id: 5,
          name: "half a cup of onions",
          price: 100,
          "recipe-id": 3
        },
        {
          id: 6,
          name: "3 Tbls ghee",
          price: 300,
          "recipe-id": 4
        },
        {
          id: 7,
          name: "1 large onion diced",
          price: 50,
          "recipe-id": 4
        },
        {
          id: 8,
          name: "4 cloves roughly chopped",
          price: 20,
          "recipe-id": 4  
        },
        {
          id: 9,
          name: "2 tbls ginger finely chopped",
          price: 10,
          "recipe-id": 4
        },
        {
          id: 10,
          name: "1 medium jalapeno finely chopped",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 11,
          name: "1/2 tsp fennel seeds",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 12,
          name: "1 tsp black mustard seeds",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 13,
          name: "2 tsp cumin seeds",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 14,
          name: "2 tsp garam masala",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 15,
          name: "1 lb baby spinach (fresh or frozen)",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 16,
          name: "15 fresh mint leaves",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 17,
          name: "1 tsp dried fenugreek leaves",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 18,
          name: "2 tbls water (if using fresh spinach)",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 19,
          name: "3/4 cups water",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 20,
          name: "1/2 cup plain yogurt (or vegan yogurt)",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 21,
          name: "3 cups cooked black lentils",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 22,
          name: "1 tsp salt, more to taste!",
          price: 100,
          "recipe-id": 4
        },
        {
          id: 23,
          name: "2 slices of bread",
          price: 50,
          "recipe-id": 5
        },
        {
          id: 24,
          name: "2 tbls of your favorite jam",
          price: 100,
          "recipe-id": 5
        },
        {
          id: 25,
          name: "2 tbls of your favorite peanut butter",
          price: 100,
          "recipe-id": 5
        },
        {
          id: 26,
          name: "1 banana",
          price: 100,
          "recipe-id": 5
        }
      ]);
    });
};
