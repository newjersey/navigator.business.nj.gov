import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderResultCount } from "./renderResultCount";

const messages = {
  resultCountShowing: "Showing <bold>{start}–{end}</bold> of {total} items",
  resultCountFiltered:
    "Showing <bold>{start}–{end}</bold> of {filtered} matching items (of {total} total)",
  resultCountFilteredEmpty: "0 matching items (of {total} total)",
};

const renderCount = (params: Parameters<typeof renderResultCount>[0]) =>
  render(<p>{renderResultCount(params)}</p>);

describe("renderResultCount", () => {
  it("shows the page range against the grand total when unfiltered", () => {
    const { container } = renderCount({
      start: 31,
      end: 40,
      shownCount: 10,
      filteredCount: 551,
      totalCount: 551,
      messages,
    });
    expect(container.textContent).toBe("Showing 31–40 of 551 items");
    expect(container.querySelector("strong")?.textContent).toBe("31–40");
  });

  it("shows the filtered count and grand-total parenthetical when filtered", () => {
    const { container } = renderCount({
      start: 31,
      end: 40,
      shownCount: 10,
      filteredCount: 87,
      totalCount: 551,
      messages,
    });
    expect(container.textContent).toBe("Showing 31–40 of 87 matching items (of 551 total)");
    expect(container.querySelector("strong")?.textContent).toBe("31–40");
  });

  it("shows the empty message with no range when a filter matches nothing", () => {
    const { container } = renderCount({
      start: 0,
      end: 0,
      shownCount: 0,
      filteredCount: 0,
      totalCount: 551,
      messages,
    });
    expect(container.textContent).toBe("0 matching items (of 551 total)");
    expect(container.querySelector("strong")).toBeNull();
  });

  it("treats a single-page filtered result as filtered, not unfiltered", () => {
    const { container } = renderCount({
      start: 1,
      end: 7,
      shownCount: 7,
      filteredCount: 7,
      totalCount: 551,
      messages,
    });
    expect(container.textContent).toBe("Showing 1–7 of 7 matching items (of 551 total)");
  });
});
