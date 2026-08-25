import { getMergedConfig } from "./configContext";

describe("getMergedConfig", () => {
  it("merges configuration from JSON sources across the complete config", () => {
    const config = getMergedConfig();

    expect(config.legalMessageDefaults).toBeDefined();
    expect(config.profileDefaults.fields).toBeDefined();
    expect(config.siteWideErrorMessages.errorRadioButton).toBe("Make a selection.");
    expect(config.businessStructurePrompt.buttonText).toBeDefined();
    expect(config.employerRates.quarterOneLabel).toBe("Jan-Mar.");
    expect(config.lockedTasksPrompt.buttonText).toBe("Create an Account");
    expect(config.learnPages.steps[0]).toEqual({
      id: "business-structure",
      name: "Select Your Business Structure",
    });
  });

  it("returns an independent configuration for each call", () => {
    const firstConfig = getMergedConfig();
    firstConfig.lockedTasksPrompt.buttonText = "Changed";

    expect(getMergedConfig().lockedTasksPrompt.buttonText).toBe("Create an Account");
  });
});
