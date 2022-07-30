const { PgLiteral } = require("node-pg-migrate");

/* eslint-disable camelcase */

exports.shorthands = {
  name: { type: "varchar(100)", notNull: true },
  ts: {
    type: "timestamp",
    notNull: true,
    default: new PgLiteral("current_timestamp"),
  },
};

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    email: "name",
    display_name: "name",
    created_at: "ts",
  });

  pgm.createTable("authentication", {
    userId: "id",
    password: { type: "varchar(60)", notNull: true },
    salt: { type: "varchar(60)", notNull: true },
  });

  pgm.createTable("photos", {
    id: "id",
    name: "name",
    created_at: "ts",
  });
};
