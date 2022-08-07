const { PgLiteral } = require("node-pg-migrate");

/* eslint-disable camelcase */

exports.shorthands = {
  name: { type: "varchar(100)", notNull: true },
  uniqueName: { type: "varchar(100)", notNull: true, unique: true },
  ts: {
    type: "timestamp",
    notNull: true,
    default: new PgLiteral("current_timestamp"),
  },
};

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    username: "uniqueName",
    display_name: "name",
    created_at: "ts",
  });

  pgm.createTable("passwords", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "cascade",
    },
    password: { type: "varchar(60)", notNull: true },
  });

  pgm.createTable("photos", {
    id: "id",
    title: "uniqueName",
    created_at: "ts",
  });
};
