exports.up = function (knex) {
  return knex.schema.createTable("recipes", (table) => {
    table.increments();
    table.string("recipe-name", 128).notNullable();
    table.string("description");
    table.string("img-url");
    table.timestamps(false, true);
    table.integer("user-id").references("id").inTable("users").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("recipes");
};
