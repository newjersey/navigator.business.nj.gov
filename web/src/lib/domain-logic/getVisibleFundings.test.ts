import { generateFunding, generateUserData } from "@/test/factories";
import { generatePreferences } from "@businessnjgovnavigator/shared/test";
import { getVisibleFundings } from "./getVisibleFundings";

describe("getVisibleFundings", () => {
  it("returns an array of all fundings when there is no matching id in hiddenFundingIds", () => {
    const userData = generateUserData({
      preferences: generatePreferences({ hiddenFundingIds: ["three"] }),
    });
    const certifications = [generateFunding({ id: "one" }), generateFunding({ id: "two" })];

    expect(getVisibleFundings(certifications, userData)).toEqual(certifications);
  });

  it("returns an array of filtered fundings when there is a matching id in hiddenFundingIds", () => {
    const userData = generateUserData({
      preferences: generatePreferences({ hiddenFundingIds: ["two"] }),
    });
    const cert1 = generateFunding({ id: "one" });
    const cert2 = generateFunding({ id: "two" });

    expect(getVisibleFundings([cert1, cert2], userData)).toEqual([cert1]);
  });
});
