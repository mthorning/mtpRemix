import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

import { pool } from "./db.server";

interface LoginForm {
  username: string;
  password: string;
  displayName?: string;
};

export interface User {
  id: number;
  username: string;
  displayName: string;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "MTP_session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

async function getUserId(request: Request): Promise<number | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") return null;
  return userId;
}

export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);
  if(!userId) return null;

  const {
    rowCount,
    rows: [{ id, username, display_name}],
  } = await pool.query("SELECT id, username, display_name FROM users WHERE id=$1 LIMIT 1", [userId]);

  if (!rowCount) throw logout(request);

  return {
    id,
    username,
    displayName: display_name
  };
}

export async function login({ username, password }: LoginForm) {
  const { rowCount, rows } = await pool.query(
    "SELECT users.id, passwords.password FROM users INNER JOIN passwords ON users.id=passwords.user_id WHERE users.username=$1 LIMIT 1",
    [username]
  );
  if (!rowCount) return null;
  const [user] = rows;

  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) return null;

  return user;
}

export async function register({ username, displayName, password }: LoginForm): Promise<number> {
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect()
  let userId = null;

  try {
    await client.query('BEGIN')
    const { rows: [{ id }] } = await pool.query(
      "INSERT INTO USERS (username, display_name) VALUES ($1, $2) RETURNING id",
      [username, displayName]
    );
    await pool.query('INSERT INTO passwords (user_id, password) VALUES ($1, $2)', [id, passwordHash]);
    await pool.query('COMMIT');
    userId = id
  } catch(e) {
    client.query('ROLLBACK')
  } finally { 
    client.release()
  }

  return userId;
}

export async function createUserSession(userId: number, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
