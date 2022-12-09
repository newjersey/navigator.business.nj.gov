import { ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { merge } from "lodash";

const Config = getMergedConfig();

describe("getProfileConfig", () => {
  const testConfig = {
    profileDefaults: {
      fields: {
        businessName: {
          default: {
            header: "header",
            description: "description",
            placeholder: "placeholder",
            errorTextRequired: "error",
          },
          overrides: {
            OWNING: {
              description: "owning-description",
            },
          },
        },
      },
    },
  };

  const mergedConfigForTest: ConfigType = merge(Config, testConfig);

  it("gets default value when no persona passed", () => {
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
    });

    expect(result).toEqual({
      header: "header",
      description: "description",
      placeholder: "placeholder",
      errorTextRequired: "error",
    });
  });

  it("gets default value when persona does not have overrides", () => {
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "FOREIGN",
    });

    expect(result).toEqual({
      header: "header",
      description: "description",
      placeholder: "placeholder",
      errorTextRequired: "error",
    });
  });

  it("mixes override fields and default for persona with overrides", () => {
    const result = getProfileConfig({
      config: mergedConfigForTest,
      fieldName: "businessName",
      persona: "OWNING",
    });

    expect(result).toEqual({
      header: "header",
      description: "owning-description",
      placeholder: "placeholder",
      errorTextRequired: "error",
    });
  });
});
