exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("ingredient-list")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("ingredient-list").insert([
        { id: 1, "user-id": 1 },
        { id: 2, "user-id": 2 },
        { id: 3, "user-id": 3 }
      ]);
    });
};
