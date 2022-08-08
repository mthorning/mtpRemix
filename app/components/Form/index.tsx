import { makeLinks } from "~/utils";
import type { SubmitFunction } from "@remix-run/react";
import formStyles from "./form.css";

export const links = makeLinks(formStyles);

interface FormProps {
  submit: SubmitFunction;
  formFields: {[key: string]: any }[];
  submitButtonText: string;
  formError?: string;
}
export default function Form({ submit, formFields, formError, submitButtonText }: FormProps) {
  return (
      <form method="post" className="form">
      {formFields.map(({ id, label, error, ...rest}) => (
        <fieldset>
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            {...rest}
          />
          {error ? (
            <p className="form-validation-error" role="alert" id="title-error">
              {error}
            </p>
          ) : null}
        </fieldset>
      ))}
        <div id="form-error-message">
          {formError ? (
            <p className="form-validation-error" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
        <button type="submit" className="button" onSubmit={e => {
          const target = e.target as HTMLButtonElement 
          submit(target)
        }}>
          {submitButtonText}
        </button>
      </form>
  );
}
