exports.up = function (knex) {
  return knex.schema.createTable("recipes", (table) => {
    table.increments();
    table.string("recipe-name", 128).notNullable();
    table.integer("user-id").references("id").inTable("users").notNullable();
    table.integer("grocery-list-id").references("id").inTable("grocery-lists");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("recipes");
};
