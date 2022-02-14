import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { generateCertification, generateProfileData, generateUserData } from "@/test/factories";

describe("filterCertifications", () => {
  it("returns filtered certifications for veteran-owned", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        ownershipTypeIds: ["veteran-owned"],
      }),
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], userData);
    expect(results.length).toEqual(3);
    expect(results).toEqual(expect.arrayContaining([cert1, cert4, cert5]));
  });

  it("returns filtered certifications for disabled-veteran", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        ownershipTypeIds: ["disabled-veteran"],
      }),
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], userData);
    expect(results.length).toEqual(3);
    expect(results).toEqual(expect.arrayContaining([cert3, cert4, cert5]));
  });

  it("returns filtered certifications for disabled-veteran / veteran-owned combo", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
      }),
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
    const cert6 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5, cert6], userData);
    expect(results.length).toEqual(5);
    expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6]));
  });

  it("returns filtered certifications empty ownership types", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        ownershipTypeIds: [],
      }),
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], userData);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert5]));
  });
});
