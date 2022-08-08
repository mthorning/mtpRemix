import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSubmit, useActionData } from "@remix-run/react";
import { makeLinks, pool } from "~/utils";
import Form from '~/components/Form'

import formStyles from "~/styles/form.css";
export const links = makeLinks(formStyles);

function validateTitle(title: unknown) {
  if (typeof title !== "string" || title.length < 3) {
    return `Titles must be at least 3 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    title: string | undefined;
  };
  fields?: {
    title: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
const serverError = (error: unknown) => json(error, { status: 500 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const title = form.get("title");
  if (typeof title !== "string") {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { title };
  const fieldErrors = {
    title: validateTitle(title),
  };

  const { rowCount: titleExists } = await pool.query(
    "SELECT id FROM photos WHERE title=$1 LIMIT 1",
    [title]
  );

  if (titleExists) {
    return badRequest({
      fields,
      formError: `Photo with the title "${title}" already exists`,
    });
  }

  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  try {
    await pool.query("INSERT INTO photos (title) VALUES ($1)", [title]);
  } catch (error) {
    return serverError(error);
  }
  return redirect("/admin");
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();

  const formFields = [
    {
      id: "title-input",
      autoFocus: true,
      type: "text",
      name: "title",
      label: "Title",
      defaultValue: actionData?.fields?.title,
      ["aria-invalid"]: Boolean(actionData?.fieldErrors?.title),
      ["aria-errormessage"]: actionData?.fieldErrors?.title
        ? "title-error"
        : undefined,
      error: actionData?.fieldErrors?.title,
    },
  ];

  return (
    <div className="content">
      <h1>Upload</h1>
      <Form
        {...{ formFields, submit }}
        formError={actionData?.formError}
        submitButtonText="Upload photo"
      />
    </div>
  );
}
