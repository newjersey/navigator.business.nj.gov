import { paginationSlots } from "./paginationSlots";

export interface PaginationMessages {
  readonly paginationPrevious: string;
  readonly paginationNext: string;
  readonly paginationLabel: string;
  readonly paginationPageLabel: string;
}

interface Props {
  readonly messages: PaginationMessages;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

/**
 * NJWDS bounded pagination. Renders at most seven numbered slots around the
 * current page, standing in for skipped ranges with non-selectable ellipsis
 * indicators, and hides the numbered slots on narrow viewports (the mobile
 * variant keeps only Previous/Next).
 *
 * See https://grove.nj.gov/reference/pagination/#behaviors
 */
const Pagination = ({ messages, currentPage, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) {
    return null;
  }

  const slots = paginationSlots({ current: currentPage, total: totalPages });

  return (
    <nav aria-label={messages.paginationLabel} className="usa-pagination">
      <ul className="usa-pagination__list">
        <li className="usa-pagination__item usa-pagination__arrow">
          <button
            type="button"
            className="usa-pagination__link usa-pagination__previous-page"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={messages.paginationPrevious}
          >
            <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
              <use href="/assets/njwds/dist/img/sprite.svg#navigate_before" />
            </svg>
            <span className="usa-pagination__link-text">{messages.paginationPrevious}</span>
          </button>
        </li>
        {slots.map((slot, index) => {
          if (slot.type === "ellipsis") {
            return (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis slots are positional and have no stable id
                key={`ellipsis-${index}`}
                className="usa-pagination__item usa-pagination__overflow"
                aria-hidden="true"
              >
                <span>…</span>
              </li>
            );
          }
          const { page } = slot;
          return (
            <li key={`page-${page}`} className="usa-pagination__item usa-pagination__page-no">
              <button
                type="button"
                className={`usa-pagination__button${page === currentPage ? " usa-current" : ""}`}
                onClick={() => onPageChange(page)}
                aria-label={messages.paginationPageLabel.replace("{page}", String(page))}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}
        <li className="usa-pagination__item usa-pagination__arrow">
          <button
            type="button"
            className="usa-pagination__link usa-pagination__next-page"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={messages.paginationNext}
          >
            <span className="usa-pagination__link-text">{messages.paginationNext}</span>
            <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
              <use href="/assets/njwds/dist/img/sprite.svg#navigate_next" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
