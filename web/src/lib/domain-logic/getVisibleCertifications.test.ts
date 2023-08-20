import { generateCertification } from "@/test/factories";
import { generateBusiness, generatePreferences } from "@businessnjgovnavigator/shared/test";
import { getVisibleCertifications } from "./getVisibleCertifications";

describe("getVisibleCertifications", () => {
  it("returns an array of all certifications when there is no matching id in hiddenCertificationIds", () => {
    const business = generateBusiness({
      preferences: generatePreferences({ hiddenCertificationIds: ["three"] }),
    });
    const certifications = [generateCertification({ id: "one" }), generateCertification({ id: "two" })];

    expect(getVisibleCertifications(certifications, business)).toEqual(certifications);
  });

  it("returns an array of filtered certifications when there is a matching id in hiddenCertificationIds", () => {
    const business = generateBusiness({
      preferences: generatePreferences({ hiddenCertificationIds: ["two"] }),
    });

    const cert1 = generateCertification({ id: "one" });
    const cert2 = generateCertification({ id: "two" });

    expect(getVisibleCertifications([cert1, cert2], business)).toEqual([cert1]);
  });
});
