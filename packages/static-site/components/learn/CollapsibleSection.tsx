"use client";

import { type ReactNode, useState } from "react";

interface CollapsibleSectionProps {
  /** Anchor id for the section element; also the base for the button/content ids. */
  readonly sectionId: string;
  /** Heading text rendered inside the accordion toggle button. */
  readonly heading: string;
  /** Whether the section starts expanded. */
  readonly defaultOpen: boolean;
  /** Content revealed when the section is expanded. */
  readonly children: ReactNode;
}

/**
 * Renders one NJWDS accordion section with React-managed open/closed state,
 * following the pattern `HeaderPrimaryNav` uses for its submenu accordions.
 * The site does not load `uswds.min.js`, so this state cannot be delegated to
 * the USWDS runtime. `useState(defaultOpen)` (not `useEffect`) keeps the SSR
 * HTML and first client render identical, avoiding a hydration mismatch.
 */
export const CollapsibleSection = ({
  sectionId,
  heading,
  defaultOpen,
  children,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const buttonId = `${sectionId}-button`;
  const contentId = `${sectionId}-content`;

  return (
    <section className="usa-accordion" id={sectionId}>
      <h2 className="usa-accordion__heading">
        <button
          aria-controls={contentId}
          aria-expanded={isOpen}
          className="usa-accordion__button"
          id={buttonId}
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          {heading}
        </button>
      </h2>
      <div className="usa-accordion__content" hidden={!isOpen || undefined} id={contentId}>
        {children}
      </div>
    </section>
  );
};
