exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("ingredient-list")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("ingredient-list").insert([
        { id: 1, "user-id": 1, "total-price": 5.25 },
        { id: 2, "user-id": 2, "total-price": 5 },
        { id: 3, "user-id": 3, "total-price": 5.5 }
      ]);
    });
};
