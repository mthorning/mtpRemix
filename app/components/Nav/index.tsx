import { Link } from "@remix-run/react";
import { makeLinks } from "~/utils";
import styles from "./nav.css";

export const links = makeLinks(styles);

interface User {
  displayName: string;
}

export default function Nav({ user }: { user: User }) {
  return (
    <nav className="top-menu">
      <Link to="/admin/upload">Upload</Link>
      <form action="/admin/logout" method="post">
        <button type="submit" className="button">
          Logout
        </button>
      </form>
    </nav>
  );
}
