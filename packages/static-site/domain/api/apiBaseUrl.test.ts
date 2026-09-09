import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl } from "./apiBaseUrl";

describe("getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the configured origin", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.account.business.nj.gov");

    expect(getApiBaseUrl()).toBe("https://api.account.business.nj.gov");
  });

  it("strips a trailing slash so callers can append an absolute path", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.account.business.nj.gov/");

    expect(getApiBaseUrl()).toBe("https://api.account.business.nj.gov");
  });

  it("strips surrounding whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "  https://api.account.business.nj.gov  ");

    expect(getApiBaseUrl()).toBe("https://api.account.business.nj.gov");
  });

  it("strips a trailing slash left behind after trimming whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", " https://api.account.business.nj.gov/ ");

    expect(getApiBaseUrl()).toBe("https://api.account.business.nj.gov");
  });

  it("preserves a base path while stripping only its trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://example.com/stage/");

    expect(getApiBaseUrl()).toBe("https://example.com/stage");
  });

  it("returns an empty string when the variable is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    expect(getApiBaseUrl()).toBe("");
  });

  it("returns an empty string when the variable holds only whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "   ");

    expect(getApiBaseUrl()).toBe("");
  });
});
