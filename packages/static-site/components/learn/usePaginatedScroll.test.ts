import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePaginatedScroll } from "./usePaginatedScroll";

describe("usePaginatedScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("sets the page, then scrolls and focuses the results region", () => {
    const setCurrentPage = vi.fn();
    const { result } = renderHook(() => usePaginatedScroll(setCurrentPage));

    const scrollIntoView = vi.fn();
    const focus = vi.fn();
    const element = { scrollIntoView, focus } as unknown as HTMLDivElement;
    result.current.resultsRef.current = element;

    result.current.handlePageChange(3);

    expect(setCurrentPage).toHaveBeenCalledWith(3);

    // Scroll/focus is deferred until after the new page renders.
    vi.runAllTimers();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("uses an instant scroll when the user prefers reduced motion", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("matchMedia", matchMedia);

    const setCurrentPage = vi.fn();
    const { result } = renderHook(() => usePaginatedScroll(setCurrentPage));
    const scrollIntoView = vi.fn();
    result.current.resultsRef.current = {
      scrollIntoView,
      focus: vi.fn(),
    } as unknown as HTMLDivElement;

    result.current.handlePageChange(2);
    vi.runAllTimers();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    vi.unstubAllGlobals();
  });

  it("does nothing extra when the results ref is unset", () => {
    const setCurrentPage = vi.fn();
    const { result } = renderHook(() => usePaginatedScroll(setCurrentPage));

    expect(() => {
      result.current.handlePageChange(2);
      vi.runAllTimers();
    }).not.toThrow();
    expect(setCurrentPage).toHaveBeenCalledWith(2);
  });
});
