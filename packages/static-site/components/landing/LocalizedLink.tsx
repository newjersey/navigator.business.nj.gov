/**
 * Renders locale-aware links for internal and external destinations.
 *
 * This module centralizes link behavior so components do not duplicate target,
 * rel, and internal-routing logic.
 */

import type { ReactNode } from "react";
import { Link } from "@/domain/i18n/navigation";
import type { LandingLink } from "@/domain/landing/types";

/**
 * Describes props accepted by the localized link component.
 *
 * This type defines a stable shape for related data.
 */
export interface LocalizedLinkProps {
  /** Link content metadata to render. */
  readonly link: LandingLink;
  /** Optional CSS class list applied to the anchor element. */
  readonly className?: string;
  /** Optional aria-label override for the anchor element. */
  readonly ariaLabel?: string;
  /** Optional title attribute for the anchor element. */
  readonly title?: string;
  /** Optional custom children for replacing the link label text. */
  readonly children?: ReactNode;
}

/**
 * Renders a localized link with internal or external behavior.
 *
 * Internal links use `next-intl` navigation. External links use a plain anchor
 * element and optional new-tab attributes.
 *
 * @param props Component props.
 * @param props.link Link metadata used to select render behavior.
 * @param props.className Optional class names for the rendered link.
 * @param props.ariaLabel Optional aria-label override.
 * @param props.title Optional title attribute.
 * @param props.children Optional custom link content.
 * @returns A locale-aware link element.
 * @example
 * ```tsx
 * <LocalizedLink link={{ label: "Home", href: "/", isInternal: true, opensInNewTab: false }} />
 * ```
 */
export const LocalizedLink = ({
  link,
  className,
  ariaLabel,
  title,
  children,
}: LocalizedLinkProps) => {
  const labelContent = children ?? link.label;

  if (link.isInternal) {
    return (
      <Link aria-label={ariaLabel} className={className} href={link.href} title={title}>
        {labelContent}
      </Link>
    );
  }

  const target = link.opensInNewTab ? "_blank" : undefined;
  const rel = link.opensInNewTab ? "noreferrer" : undefined;

  return (
    <a
      aria-label={ariaLabel}
      className={className}
      href={link.href}
      rel={rel}
      target={target}
      title={title}
    >
      {labelContent}
    </a>
  );
};
