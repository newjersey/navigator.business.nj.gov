import type { PlasticBanContentsEntry } from "@/components/learn/parsePlasticBanSections";

/** Element id for the Contents heading; supplies the nav's accessible name. */
const CONTENTS_HEADING_ID = "page-contents-heading";

interface PageContentsNavProps {
  /** Heading text rendered above the jump-link list. */
  readonly heading: string;
  /** Curated jump-link entries, in display order. */
  readonly entries: readonly PlasticBanContentsEntry[];
}

/**
 * Renders a curated in-page jump-link rail using NJWDS `usa-in-page-nav`
 * styling, which is `display: none` below 40em and `position: sticky` above
 * it. Uses a single `<nav>` wrapping a `<div>` (rather than USWDS's reference
 * `<aside>` + nested `<nav>`) so this landmark never nests inside another
 * `complementary` landmark. The visible heading supplies the nav's accessible
 * name via `aria-labelledby`, since the links are curated rather than
 * generated from page headings.
 */
export const PageContentsNav = ({ heading, entries }: PageContentsNavProps) => {
  if (entries.length === 0) return null;

  return (
    <nav aria-labelledby={CONTENTS_HEADING_ID} className="usa-in-page-nav">
      <div className="usa-in-page-nav__nav">
        <h2 className="usa-in-page-nav__heading" id={CONTENTS_HEADING_ID}>
          {heading}
        </h2>
        <ul className="usa-in-page-nav__list">
          {entries.map((entry) => (
            <li className="usa-in-page-nav__item" key={entry.href}>
              <a className="usa-in-page-nav__link" href={entry.href}>
                {entry.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
