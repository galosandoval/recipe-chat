exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments();
    table.string("firstName", 128);
    table.string("lastName", 128);
    table.string("username", 128).notNullable().unique();
    table.string("password", 128).notNullable();
    table.timestamps(false, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
