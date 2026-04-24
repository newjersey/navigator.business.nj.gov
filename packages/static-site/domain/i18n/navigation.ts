/**
 * Provides locale-aware navigation helpers for the static site.
 *
 * This module wraps `next-intl` navigation creation so callers share one
 * routing source of truth.
 */

import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Exposes locale-aware navigation helpers generated from `routing`.
 *
 * Components import these helpers to build links and redirects that preserve
 * locale prefixes.
 */
export const { Link, getPathname, redirect, usePathname, useRouter } = createNavigation(routing);
