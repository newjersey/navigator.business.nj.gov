import { afterEach, describe, expect, it, vi } from "vitest";
import { isHousingDeveloperResourcesEnabled } from "./housingDeveloperResourcesFlag";

describe("isHousingDeveloperResourcesEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when the flag is exactly true", () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

    expect(isHousingDeveloperResourcesEnabled()).toBe(true);
  });

  it("returns false when the flag is exactly false", () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "false");

    expect(isHousingDeveloperResourcesEnabled()).toBe(false);
  });

  it("fails closed when the flag is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "");

    expect(isHousingDeveloperResourcesEnabled()).toBe(false);
  });

  it("fails closed for unrecognized values", () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "enabled");

    expect(isHousingDeveloperResourcesEnabled()).toBe(false);
  });

  it("does not treat differently cased values as enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "TRUE");

    expect(isHousingDeveloperResourcesEnabled()).toBe(false);
  });
});
