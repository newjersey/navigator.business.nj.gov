import { useCallback, useRef } from "react";

interface PaginatedScroll {
  /** Attach to the results region that should scroll into view on page change. */
  readonly resultsRef: React.RefObject<HTMLElement | null>;
  /** Sets the page, then scrolls the results region into view and focuses it. */
  readonly handlePageChange: (page: number) => void;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wires a paginated list's page-change handler to scroll the results region to
 * the top and move focus there. Neither Grove nor USWDS prescribe scroll
 * behavior for pagination, so this follows the `web` app's convention
 * (`scrollToTopOfElement` with focus) and standard accessible-pagination
 * practice: after switching pages, reposition the user at the first result and
 * move focus so assistive technology announces the new content.
 */
export const usePaginatedScroll = (setCurrentPage: (page: number) => void): PaginatedScroll => {
  const resultsRef = useRef<HTMLElement | null>(null);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      // Defer until the new page has rendered so we scroll to settled content.
      setTimeout(() => {
        const element = resultsRef.current;
        // `scrollIntoView`/`focus` are unavailable in non-DOM environments (SSR,
        // JSDOM); skip rather than throw when they are missing.
        if (element === null || typeof element.scrollIntoView !== "function") {
          return;
        }
        element.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
        element.focus?.({ preventScroll: true });
      }, 0);
    },
    [setCurrentPage],
  );

  return { resultsRef, handlePageChange };
};
