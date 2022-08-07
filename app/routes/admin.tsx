import { useLoaderData, Outlet } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getUser } from "~/utils/session.server";
import type { User } from "~/utils/session.server";
import Nav, { links as navLinks } from "~/components/Nav";

export const links = navLinks;

export interface Context {
  user: User;
}

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  // THIS ISN'T REDIRECTING!!
  if (!user) {
    return redirect("/login");
  }
  return json(user);
}

export default function AdminRoute() {
  const user = useLoaderData<User>();
  const context: Context = { user };
  return (
    <>
      <Nav user={user} />
      <Outlet context={context} />
    </>
  );
}
