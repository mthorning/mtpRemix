import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { createUserSession, register, makeLinks, pool } from "~/utils";

import routeStyles from "~/styles/login-register.css";
import formStyles from "~/styles/form.css";
export const links = makeLinks(routeStyles, formStyles)

function validateName(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

function validatePasswordAgain(password: unknown, passwordAgain: unknown) {
  if (password !== passwordAgain) {
    return `Passwords do not match`;
  }
}

async function alreadyHasUser(): Promise<boolean> {
  const { rowCount } = await pool.query("SELECT * FROM users LIMIT 1");
  return !!rowCount;
}

export async function loader() {
  const hasUser = await alreadyHasUser();
  if (hasUser) {
    return redirect("/login");
  }
  return json({});
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    displayName: string | undefined;
    password: string | undefined;
    passwordAgain: string | undefined;
  };
  fields?: {
    username: string;
    displayName: string;
    password: string;
    passwordAgain: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const hasUser = await alreadyHasUser();
  if (hasUser) {
    return badRequest({
      formError: `User already exists`,
    });
  }

  const form = await request.formData();

  const username = form.get("username");
  const displayName = form.get("displayName");
  const password = form.get("password");
  const passwordAgain = form.get("passwordAgain");
  if (
    typeof username !== "string" ||
    typeof displayName !== "string" ||
    typeof password !== "string" ||
    typeof passwordAgain !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { username, displayName, password, passwordAgain };
  const fieldErrors = {
    username: validateName(username),
    displayName: validateName(username),
    password: validatePassword(password),
    passwordAgain: validatePasswordAgain(password, passwordAgain),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const { rowCount: userExists } = await pool.query(
    "SELECT id FROM users WHERE username=$1 LIMIT 1",
    [username]
  );

  if (userExists) {
    return badRequest({
      fields,
      formError: `User with username ${username} already exists`,
    });
  }

  const userId = await register({ username, displayName, password });
  if (!userId) {
    return badRequest({
      fields,
      formError: `Something went wrong trying to create a new user.`,
    });
  }
  return createUserSession(userId, "/admin");
};

export default function Register() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="container">
      <div className="content">
        <h1>Register</h1>
        <form method="post">
          <fieldset>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-errormessage={
                actionData?.fieldErrors?.username ? "username-error" : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </fieldset>
          <fieldset>
            <label htmlFor="display-name-input">Display name</label>
            <input
              type="text"
              id="display-name-input"
              name="displayName"
              defaultValue={actionData?.fields?.displayName}
              aria-invalid={Boolean(actionData?.fieldErrors?.displayName)}
              aria-errormessage={
                actionData?.fieldErrors?.displayName
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.displayName ? (
              <p
                className="form-validation-error"
                role="alert"
                id="display-name-error"
              >
                {actionData.fieldErrors.displayName}
              </p>
            ) : null}
          </fieldset>
          <fieldset>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </fieldset>
          <fieldset>
            <label htmlFor="password-again-input">Re-enter password</label>
            <input
              id="password-again-input"
              name="passwordAgain"
              type="password"
              defaultValue={actionData?.fields?.passwordAgain}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.passwordAgain) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.passwordAgain
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.passwordAgain ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.passwordAgain}
              </p>
            ) : null}
          </fieldset>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Create user
          </button>
        </form>
      </div>
    </div>
  );
}
