export type PaginationSlot =
  | { readonly type: "page"; readonly page: number }
  | { readonly type: "ellipsis" };

interface PaginationSlotsParams {
  readonly current: number;
  readonly total: number;
}

const page = (n: number): PaginationSlot => ({ type: "page", page: n });
const ellipsis: PaginationSlot = { type: "ellipsis" };

const range = (start: number, end: number): PaginationSlot[] => {
  const slots: PaginationSlot[] = [];
  for (let n = start; n <= end; n += 1) {
    slots.push(page(n));
  }
  return slots;
};

/**
 * Computes the slot sequence for the NJWDS bounded pagination component. The
 * component renders at most seven slots: the first page, the last page, the
 * current page, and a window around it, with non-selectable ellipsis indicators
 * standing in for any pages skipped between them.
 *
 * See https://grove.nj.gov/reference/pagination/#behaviors
 */
export const paginationSlots = ({ current, total }: PaginationSlotsParams): PaginationSlot[] => {
  if (total <= 7) {
    return range(1, total);
  }

  const nearStart = current <= 4;
  const nearEnd = current >= total - 3;

  if (nearStart) {
    return [...range(1, 5), ellipsis, page(total)];
  }

  if (nearEnd) {
    return [page(1), ellipsis, ...range(total - 4, total)];
  }

  return [page(1), ellipsis, ...range(current - 1, current + 1), ellipsis, page(total)];
};
