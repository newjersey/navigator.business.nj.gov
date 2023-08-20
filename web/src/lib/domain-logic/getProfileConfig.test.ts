import { ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { merge } from "lodash";

const Config = getMergedConfig();

describe("getProfileConfig", () => {
  const testConfigDefault = {
    profileDefaults: {
      fields: {
        businessName: {
          default: {
            header: "header",
            description: "default description",
            errorTextRequired: "error",
            headerContextualInfo: "default header contextual info",
          },
        },
      },
    },
  };

  const testConfigDefaultWithOverride = {
    profileDefaults: {
      fields: {
        businessName: {
          default: {
            header: "header",
            description: "default description",
            errorTextRequired: "error",
            headerContextualInfo: "default header contextual info",
          },
          overrides: {
            OWNING: {
              description: "default-owning-description",
            },
          },
        },
      },
    },
  };
  const testConfigDefaultWithOverridesAndOboarding = {
    profileDefaults: {
      fields: {
        businessName: {
          default: {
            header: "header",
            description: "default description",
            errorTextRequired: "error",
            headerContextualInfo: "default header contextual info",
          },
          onboarding: {
            default: {
              header: "onboarding header",
              description: "onboarding default description",
            },
          },
          overrides: {
            OWNING: {
              description: "default-owning-description",
            },
          },
        },
      },
    },
  };

  const testConfigDefaultWithOverridesAndOboardingWithOverrides = {
    profileDefaults: {
      fields: {
        businessName: {
          default: {
            header: "header",
            description: "default description",
            errorTextRequired: "error",
            headerContextualInfo: "default header contextual info",
          },
          onboarding: {
            default: {
              header: "onboarding header",
              description: "onboarding default description",
            },
            overrides: {
              OWNING: {
                description: "onboarding-owning-description",
              },
            },
          },
          overrides: {
            OWNING: {
              description: "default-owning-description",
            },
          },
        },
      },
    },
  };

  it("gets default value when no persona passed", () => {
    const mergedConfigForTest: ConfigType = merge(Config, testConfigDefault);

    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
    });

    expect(result).toEqual({
      header: "header",
      description: "default description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });

  it("gets overrides value when a persona is passed and mixes overrides and defaults", () => {
    const mergedConfigForTest: ConfigType = merge(Config, testConfigDefaultWithOverride);
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "OWNING",
    });

    expect(result).toEqual({
      header: "header",
      description: "default-owning-description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });

  it("gets default value when persona does not have overrides", () => {
    const mergedConfigForTest: ConfigType = merge(Config, testConfigDefaultWithOverride);
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "FOREIGN",
    });

    expect(result).toEqual({
      header: "header",
      description: "default description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });

  it("gets default onboarding value when persona does not have overrides", () => {
    const mergedConfigForTest: ConfigType = merge(
      Config,
      testConfigDefaultWithOverridesAndOboardingWithOverrides
    );
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "FOREIGN",
      onboarding: true,
    });

    expect(result).toEqual({
      header: "onboarding header",
      description: "onboarding default description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });

  it("gets onboarding value when no persona passed", () => {
    const mergedConfigForTest: ConfigType = merge(Config, testConfigDefaultWithOverridesAndOboarding);
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      onboarding: true,
    });

    expect(result).toEqual({
      header: "onboarding header",
      description: "onboarding default description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });

  it("gets onboarding value with persona override", () => {
    const mergedConfigForTest: ConfigType = merge(
      Config,
      testConfigDefaultWithOverridesAndOboardingWithOverrides
    );
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "OWNING",
      onboarding: true,
    });

    expect(result).toEqual({
      header: "onboarding header",
      description: "onboarding-owning-description",
      errorTextRequired: "error",
      headerContextualInfo: "default header contextual info",
    });
  });
});
