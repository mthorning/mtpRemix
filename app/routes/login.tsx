import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { pool, login, createUserSession, makeLinks } from "~/utils";

import routeStyles from "~/styles/login-register.css";
import formStyles from "~/styles/form.css";
export const links = makeLinks(routeStyles, formStyles);

type ActionData = {
  formError?: string;
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export async function loader() {
  const { rowCount: hasUsers } = await pool.query(
    "SELECT * FROM users LIMIT 1"
  );
  if (!hasUsers) {
    return redirect("/register");
  }
  return json({ ok: true });
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  if (typeof username !== "string" || typeof password !== "string") {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { username, password };

  const user = await login({ username, password });
  if (!user) {
    return badRequest({
      fields,
      formError: `Something went wrong trying to login`,
    });
  }
  return createUserSession(user.id, "/admin");
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  return (
    <div className="container">
      <div className="content">
        <h1>Login</h1>
        <form method="post">
          <fieldset>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              type="password"
            />
          </fieldset>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
