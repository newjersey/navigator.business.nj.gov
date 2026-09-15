import { afterEach, describe, expect, it, vi } from "vitest";

import { isSearchEnabled } from "./searchFlag";

describe("isSearchEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when NEXT_PUBLIC_SEARCH_ENABLED is 'true'", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");
    expect(isSearchEnabled()).toBe(true);
  });

  it("returns false when NEXT_PUBLIC_SEARCH_ENABLED is 'false'", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "false");
    expect(isSearchEnabled()).toBe(false);
  });

  it("returns false when NEXT_PUBLIC_SEARCH_ENABLED is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "");
    expect(isSearchEnabled()).toBe(false);
  });
});
