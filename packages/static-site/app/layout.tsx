import type { ReactNode } from "react";

/**
 * Pass-through root layout.
 *
 * `app/[locale]/layout.tsx` renders the actual `<html>`/`<body>` shell for
 * every locale-scoped route. This root layout exists only because Next.js
 * requires one in scope for `app/not-found.tsx` to render — it must not add
 * its own `<html>`/`<body>` wrapping.
 */
const RootLayout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default RootLayout;
