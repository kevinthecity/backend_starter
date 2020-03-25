const { onUpdateTrigger } = require("../../knexfile");

exports.up = async knex =>
  knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable("users", table => {
      table
        .uuid("id")
        .primary()
        .notNullable()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.string("email");
      table.unique(["email"]);
      table.string("password");
      // Last time a reset token was issued
      // Updated every time a new one is issued, ensuring only the newest one can be used
      table.integer("reset_last_iat").unsigned();
      // Last time the password was changed. If your token IAT is before this, invalid token
      table.integer("last_valid_iat").unsigned();
      table.timestamps(true, true);
    })
    // This is only necessary if you want to use the timestamp triggers to auto-update "updated_at"
    .then(() => knex.raw(onUpdateTrigger("users")));

exports.down = async knex => knex.schema.dropTableIfExists("users");
