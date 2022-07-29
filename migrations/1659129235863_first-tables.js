const { PgLiteral } = require("node-pg-migrate");

/* eslint-disable camelcase */

exports.shorthands = {
  name: { type: "varchar(100)", notNull: true },
  createdAt: {
    type: "timestamp",
    notNull: true,
    default: new PgLiteral("current_timestamp"),
  },
};

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    name: "name",
    createdAt: "createdAt",
  });

  pgm.createTable("photos", {
    id: "id",
    name: "name",
    createdAt: "createdAt",
  });
};
