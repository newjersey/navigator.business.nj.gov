import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

const messages = {
  paginationPrevious: "Previous",
  paginationNext: "Next",
  paginationLabel: "Pagination",
  paginationPageLabel: "Page {page}",
};

const renderPagination = (props: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (p: number) => void;
}) =>
  render(
    <Pagination
      messages={messages}
      currentPage={props.currentPage}
      totalPages={props.totalPages}
      onPageChange={props.onPageChange ?? (() => {})}
    />,
  );

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = renderPagination({ currentPage: 1, totalPages: 1 });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every page button when pages fit without overflow", () => {
    renderPagination({ currentPage: 1, totalPages: 5 });
    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole("button", { name: `Page ${n}` })).toBeInTheDocument();
    }
    expect(screen.queryByText("…")).not.toBeInTheDocument();
  });

  it("collapses long page ranges with overflow ellipses instead of every page", () => {
    renderPagination({ currentPage: 1, totalPages: 56 });

    // First, current, and last pages are always reachable.
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 56" })).toBeInTheDocument();

    // A deep middle page is hidden behind the overflow indicator.
    expect(screen.queryByRole("button", { name: "Page 30" })).not.toBeInTheDocument();

    // The ellipsis indicator is present and non-interactive.
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  it("marks the current page with aria-current", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  it("invokes onPageChange with the chosen page", () => {
    const onPageChange = vi.fn();
    renderPagination({ currentPage: 1, totalPages: 5, onPageChange });
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = renderPagination({ currentPage: 1, totalPages: 5 });
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    rerender(
      <Pagination messages={messages} currentPage={5} totalPages={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
