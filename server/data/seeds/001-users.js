exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("users").insert([
        {
          id: 1,
          firstName: "Galo",
          lastName: "Sandoval",
          email: "galo@gmail.com",
          password: "password"
        },
        {
          id: 2,
          firstName: "Raymond",
          lastName: "Rowe",
          email: "rowe@gmail.com",
          password: "password"
        },
        {
          id: 3,
          firstName: "Kendrick",
          lastName: "Lamar",
          email: "kendrick@gmail.com",
          password: "password"
        }
      ]);
    });
};
