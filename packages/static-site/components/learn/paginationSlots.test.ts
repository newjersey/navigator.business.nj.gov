import { describe, expect, it } from "vitest";
import { paginationSlots } from "./paginationSlots";

const pages = (total: number, current: number): string =>
  paginationSlots({ current, total })
    .map((slot) => (slot.type === "ellipsis" ? "…" : String(slot.page)))
    .join(" ");

describe("paginationSlots", () => {
  it("shows every page when total is seven or fewer", () => {
    expect(pages(7, 1)).toBe("1 2 3 4 5 6 7");
    expect(pages(3, 2)).toBe("1 2 3");
    expect(pages(1, 1)).toBe("1");
  });

  it("shows the first five pages with a trailing ellipsis near the start", () => {
    expect(pages(20, 1)).toBe("1 2 3 4 5 … 20");
    expect(pages(20, 3)).toBe("1 2 3 4 5 … 20");
    expect(pages(20, 4)).toBe("1 2 3 4 5 … 20");
  });

  it("shows ellipses on both sides when the current page is in the middle", () => {
    expect(pages(20, 5)).toBe("1 … 4 5 6 … 20");
    expect(pages(20, 10)).toBe("1 … 9 10 11 … 20");
    expect(pages(20, 16)).toBe("1 … 15 16 17 … 20");
  });

  it("shows the last five pages with a leading ellipsis near the end", () => {
    expect(pages(20, 17)).toBe("1 … 16 17 18 19 20");
    expect(pages(20, 18)).toBe("1 … 16 17 18 19 20");
    expect(pages(20, 20)).toBe("1 … 16 17 18 19 20");
  });
});
