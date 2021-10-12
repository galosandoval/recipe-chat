exports.up = function (knex) {
  return knex.schema.createTable("grocery-lists", (table) => {
    table.increments();
    table.string("name").notNullable();
    table.integer("user-id").references("id").inTable("users").notNullable();
    table.timestamps(false, true);
    table.boolean("completed").defaultTo(false).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("grocery-lists");
};
// 20210814114159_create-grocery-lists-table
