import { afterEach, describe, expect, it, vi } from "vitest";

describe("routing.locales", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("contains only en-US when multilingual is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { routing } = await import("./routing");
    expect(routing.locales).toEqual(["en-US"]);
  });

  it("contains en-US and es-US when multilingual is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const { routing } = await import("./routing");
    expect(routing.locales).toContain("en-US");
    expect(routing.locales).toContain("es-US");
  });
});
