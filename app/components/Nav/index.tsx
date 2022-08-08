import { NavLink } from "@remix-run/react";
import { makeLinks } from "~/utils";
import navStyles from "./nav.css";

export const links = makeLinks(navStyles);

interface User {
  displayName: string;
}

const navLinks = [
  { name: "Gallery", href: "/" },
  { name: "Upload", href: "/admin/upload" },
  { name: "Admin", href: "/admin" },
];

export default function Nav({ user }: { user: User }) {
  return (
    <nav className="top-menu">
      {navLinks.map(({ name, href }) => (
        <NavLink
          end
          className="button"
          to={href}
          style={({ isActive }) => (isActive ? { display: "none" } : {})}
        >
          {name}
        </NavLink>
      ))}
      <form action="/admin/logout" method="post">
        <button type="submit" className="button danger">
          Logout {user.displayName}
        </button>
      </form>
    </nav>
  );
}
