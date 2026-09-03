import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Imports the component fresh so the module-scoped env read re-runs per test.
 */
const importSurveyMonkey = async () => {
  vi.resetModules();
  const module = await import("./SurveyMonkey");

  return module.SurveyMonkey;
};

/**
 * Stubs `window.matchMedia` to report the given tablet-and-up match state.
 */
const stubTabletAndUp = (matches: boolean) => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }));
};

describe("SurveyMonkey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    // next/script appends `afterInteractive` scripts to document.body directly,
    // outside the render container, so testing-library's auto-cleanup misses them.
    document.body.querySelector("#smcx-sdk")?.remove();
  });

  it("renders the widget script on tablet and up when enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", "true");
    stubTabletAndUp(true);
    const SurveyMonkey = await importSurveyMonkey();

    render(<SurveyMonkey />);

    expect(document.body.querySelector("#smcx-sdk")).not.toBeNull();
  });

  it("renders nothing on mobile even when enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", "true");
    stubTabletAndUp(false);
    const SurveyMonkey = await importSurveyMonkey();

    render(<SurveyMonkey />);

    expect(document.body.querySelector("#smcx-sdk")).toBeNull();
  });

  it("renders nothing when disabled, even on tablet and up", async () => {
    vi.stubEnv("NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", "false");
    stubTabletAndUp(true);
    const SurveyMonkey = await importSurveyMonkey();

    render(<SurveyMonkey />);

    expect(document.body.querySelector("#smcx-sdk")).toBeNull();
  });

  it("renders nothing when the flag is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SURVEY_MONKEY_ENABLED", "");
    stubTabletAndUp(true);
    const SurveyMonkey = await importSurveyMonkey();

    render(<SurveyMonkey />);

    expect(document.body.querySelector("#smcx-sdk")).toBeNull();
  });
});
