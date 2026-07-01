import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HighlightedText, splitHighlight } from "./highlightMatches";

describe("splitHighlight", () => {
  it("returns the whole string as one non-match segment for an empty query", () => {
    expect(splitHighlight("Hello world", "")).toEqual([{ text: "Hello world", match: false }]);
  });

  it("returns the whole string as one non-match segment for a whitespace query", () => {
    expect(splitHighlight("Hello world", "   ")).toEqual([{ text: "Hello world", match: false }]);
  });

  it("returns a single non-match segment when there is no match", () => {
    expect(splitHighlight("Hello world", "xyz")).toEqual([{ text: "Hello world", match: false }]);
  });

  it("splits around a single match", () => {
    expect(splitHighlight("Hello world", "world")).toEqual([
      { text: "Hello ", match: false },
      { text: "world", match: true },
    ]);
  });

  it("matches case-insensitively while preserving the original casing", () => {
    expect(splitHighlight("Grant Program", "grant")).toEqual([
      { text: "Grant", match: true },
      { text: " Program", match: false },
    ]);
  });

  it("splits around multiple matches", () => {
    expect(splitHighlight("aXaXa", "x")).toEqual([
      { text: "a", match: false },
      { text: "X", match: true },
      { text: "a", match: false },
      { text: "X", match: true },
      { text: "a", match: false },
    ]);
  });

  it("handles adjacent matches", () => {
    expect(splitHighlight("aa", "a")).toEqual([
      { text: "a", match: true },
      { text: "a", match: true },
    ]);
  });
});

describe("HighlightedText", () => {
  it("wraps matched text in a mark with the highlight class", () => {
    const { container } = render(<HighlightedText text="Grant Program" query="grant" />);
    const mark = container.querySelector("mark.funding-search-highlight");
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("Grant");
  });

  it("renders plain text with no mark when the query is empty", () => {
    const { container } = render(<HighlightedText text="Grant Program" query="" />);
    expect(container.querySelector("mark")).toBeNull();
    expect(container).toHaveTextContent("Grant Program");
  });
});
