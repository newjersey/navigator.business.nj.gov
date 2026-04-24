/**
 * Renders the skip-navigation link used at the top of the landing page.
 *
 * This module provides the accessibility shortcut that jumps keyboard users
 * directly to the main content region.
 */

/**
 * Describes the props used to render the skip-navigation link.
 *
 * The anchor target must match the `id` on the main page content element.
 */
export interface SkipNavProps {
  /** Link label rendered for skip navigation. */
  readonly label: string;
  /** Main content anchor target ID. */
  readonly mainContentId: string;
}

/**
 * Renders the NJWDS-style skip-navigation anchor.
 *
 * This component is intentionally small and stateless. It only maps typed
 * props into the expected markup and classes.
 *
 * @param props Component props.
 * @param props.label Link label announced to screen readers and users.
 * @param props.mainContentId ID of the main content element.
 * @returns The skip-navigation anchor element.
 * @example
 * ```tsx
 * <SkipNav label="Skip to content" mainContentId="main-content" />
 * ```
 */
export const SkipNav = ({ label, mainContentId }: SkipNavProps) => {
  return (
    <a className="usa-skipnav" href={`#${mainContentId}`}>
      {label}
    </a>
  );
};
