import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getUser } from "../../utils/session.server";

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/admin/login");
  }
  return json(user);
}

export default function Admin() {
  const user = useLoaderData();
  return (
    <>
      <h1>Admin</h1>
      <p>Hello {user.display_name}</p>
    </>
  );
}
