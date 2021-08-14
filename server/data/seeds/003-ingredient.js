exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("ingredient")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("ingredient").insert([
        {
          id: 1,
          name: "onion",
          price: 100,
          measurement: "cups",
          amount: 0.5,
          "ingredient-list-id": 1
        },
        {
          id: 2,
          name: "red bellpepper",
          price: 50,
          measurement: "cups",
          amount: 0.5,
          "ingredient-list-id": 1
        },
        {
          id: 3,
          name: "garlic",
          price: 100,
          measurement: "cloves",
          amount: 3,
          "ingredient-list-id": 1
        },
        {
          id: 4,
          name: "eggs",
          price: 50,
          measurement: "each",
          amount: 6,
          "ingredient-list-id": 2
        },
        {
          id: 5,
          name: "onion",
          price: 100,
          measurement: "cups",
          amount: 0.5,
          "ingredient-list-id": 3
        }
      ]);
    });
};
