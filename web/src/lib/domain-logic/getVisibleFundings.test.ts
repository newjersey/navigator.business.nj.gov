import { generateFunding } from "@/test/factories";
import { generateBusiness, generatePreferences } from "@businessnjgovnavigator/shared/test";
import { getVisibleFundings } from "./getVisibleFundings";

describe("getVisibleFundings", () => {
  it("returns an array of all fundings when there is no matching id in hiddenFundingIds", () => {
    const business = generateBusiness({
      preferences: generatePreferences({ hiddenFundingIds: ["three"] })
    });
    const certifications = [generateFunding({ id: "one" }), generateFunding({ id: "two" })];

    expect(getVisibleFundings(certifications, business)).toEqual(certifications);
  });

  it("returns an array of filtered fundings when there is a matching id in hiddenFundingIds", () => {
    const business = generateBusiness({
      preferences: generatePreferences({ hiddenFundingIds: ["two"] })
    });
    const cert1 = generateFunding({ id: "one" });
    const cert2 = generateFunding({ id: "two" });

    expect(getVisibleFundings([cert1, cert2], business)).toEqual([cert1]);
  });
});
