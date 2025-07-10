import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";

describe("getProfileErrorAlertText", () => {
  const config = getMergedConfig();

  it("returns correct message for one error", () => {
    const expected = templateEval(config.profileDefaults.default.errorTextBody, {
      fieldText: config.profileDefaults.default.errorErrorAlertOneField,
    });

    const result = getProfileErrorAlertText(1);

    expect(result).toBe(expected);
  });

  it("returns correct message for multiple errors", () => {
    const expected = templateEval(config.profileDefaults.default.errorTextBody, {
      fieldText: config.profileDefaults.default.errorAlertMultipleFields,
    });

    const result = getProfileErrorAlertText(3);

    expect(result).toBe(expected);
  });
});
