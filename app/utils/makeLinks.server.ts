import type { LinksFunction } from "@remix-run/node";

export function makeLinks(...links: string[]): LinksFunction {
  return () => links.map((href) => ({ rel: "stylesheet", href }));
}
