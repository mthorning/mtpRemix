import { Pool } from "pg";

let pool: Pool;

declare global {
  var __pool: Pool | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  pool = new Pool();
} else {
  if (!global.__pool) {
    global.__pool = new Pool();
  }
  pool = global.__pool;
}

export { pool };
