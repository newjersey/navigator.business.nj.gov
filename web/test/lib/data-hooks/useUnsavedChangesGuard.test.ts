import { useUnsavedChangesGuard } from "@/lib/data-hooks/useUnsavedChangesGuard";
import { mockRouterEvents, useMockRouter } from "@/test/mock/mockRouter";
import { renderHook } from "@testing-library/react";
import { act } from "react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("useUnsavedChangesGuard", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRouterEvents.reset();
    useMockRouter({ isReady: true });
  });

  it("does nothing when there are no unsaved changes", () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({
        hasUnsavedChanges: false,
      }),
    );

    expect(() => {
      act(() => {
        mockRouterEvents.emit("routeChangeStart", "/dashboard");
      });
    }).not.toThrow();

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.pendingUrl).toBeNull();
  });

  it("emits routeChangeError with cancelled flag when there are unsaved changes", () => {
    const routeChangeErrorHandler = jest.fn();
    mockRouterEvents.on("routeChangeError", routeChangeErrorHandler);

    renderHook(() =>
      useUnsavedChangesGuard({
        hasUnsavedChanges: true,
      }),
    );

    expect(() => {
      act(() => {
        mockRouterEvents.emit("routeChangeStart", "/dashboard");
      });
    }).toThrow("Navigation blocked due to unsaved changes");

    expect(routeChangeErrorHandler).toHaveBeenCalled();
    const [error, url] = routeChangeErrorHandler.mock.calls[0];
    expect((error as { cancelled?: boolean }).cancelled).toBe(true);
    expect(url).toBe("/dashboard");
  });
});
