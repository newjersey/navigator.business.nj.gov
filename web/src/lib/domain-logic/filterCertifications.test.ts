import {
  filterCertifications,
  LARGE_BUSINESS_MIN_EMPLOYEE_COUNT,
} from "@/lib/domain-logic/filterCertifications";
import { generateCertification, generateProfileData, generateUserData } from "@/test/factories";
import { ProfileData, UserData } from "@businessnjgovnavigator/shared/";

describe("filterCertifications", () => {
  const defaultProfileData = (overrides: Partial<ProfileData>): UserData => {
    return generateUserData({
      profileData: generateProfileData({
        ownershipTypeIds: [],
        existingEmployees: String(LARGE_BUSINESS_MIN_EMPLOYEE_COUNT),
        ...overrides,
      }),
    });
  };

  it("returns filtered certifications for veteran-owned", () => {
    const userData = defaultProfileData({ ownershipTypeIds: ["veteran-owned"] });

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
    const userData = defaultProfileData({ ownershipTypeIds: ["disabled-veteran"] });

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
    const userData = defaultProfileData({ ownershipTypeIds: ["veteran-owned", "disabled-veteran"] });

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
    const userData = defaultProfileData({});

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], userData);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert5]));
  });

  it("returns filtered certification when number of employees is less than 120", () => {
    const userData = defaultProfileData({ existingEmployees: String(LARGE_BUSINESS_MIN_EMPLOYEE_COUNT - 1) });

    const cert1 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
    const results = filterCertifications([cert1], userData);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert1]));
  });

  it("returns empty filtered certifications when number of employees is greater than or equal to 120", () => {
    const userData = defaultProfileData({});

    const cert1 = generateCertification({ isSbe: true });
    const results = filterCertifications([cert1], userData);
    expect(results.length).toEqual(0);
    expect(results).toEqual(expect.not.arrayContaining([cert1]));
  });

  it("returns filtered certifications for disabled-veteran / veteran-owned combo and SBE Certification", () => {
    const userData = defaultProfileData({
      ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
      existingEmployees: String(LARGE_BUSINESS_MIN_EMPLOYEE_COUNT - 1),
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
    const cert6 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
    const cert7 = generateCertification({
      isSbe: true,
      applicableOwnershipTypes: ["minority-owned"],
    });
    const cert8 = generateCertification({
      isSbe: true,
      applicableOwnershipTypes: ["veteran-owned"],
    });
    const cert9 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications(
      [cert1, cert2, cert3, cert4, cert5, cert6, cert7, cert8, cert9],
      userData
    );
    expect(results.length).toEqual(7);
    expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6, cert8, cert9]));
  });
});
