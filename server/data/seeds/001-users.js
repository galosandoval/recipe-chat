exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("users").insert([
        {
          id: 1,
          firstName: "Galo",
          lastName: "Sandoval",
          username: "demo",
          password: "demo"
        },
        {
          id: 2,
          firstName: "Raymond",
          lastName: "Rowe",
          username: "rowe@gmail.com",
          password: "password"
        },
        {
          id: 3,
          firstName: "Kendrick",
          lastName: "Lamar",
          username: "kendrick@gmail.com",
          password: "password"
        }
      ]);
    });
};
