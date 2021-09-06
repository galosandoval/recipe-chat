exports.up = function (knex) {
  return knex.schema.createTable("recipes", (table) => {
    table.increments();
    table.string("recipe-name", 128).notNullable();
    table.string("description");
    table.integer("user-id").references("id").inTable("users").notNullable();
    table.integer("grocery-list-id").references("id").inTable("grocery-lists");
    table.string("img-url");
    table.timestamps(false, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("recipes");
};
