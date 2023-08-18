import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { generateCertification } from "@/test/factories";
import { Business } from "@businessnjgovnavigator/shared";
import { generateBusiness, generateProfileData, ProfileData } from "@businessnjgovnavigator/shared/";

describe("filterCertifications", () => {
  const businessWithDefaultProfileData = (overrides: Partial<ProfileData>): Business => {
    return generateBusiness({
      profileData: generateProfileData({
        ownershipTypeIds: [],
        existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT),
        ...overrides
      })
    });
  };

  it("returns filtered certifications for veteran-owned", () => {
    const business = businessWithDefaultProfileData({ ownershipTypeIds: ["veteran-owned"] });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], business);
    expect(results.length).toEqual(3);
    expect(results).toEqual(expect.arrayContaining([cert1, cert4, cert5]));
  });

  it("returns filtered certifications for disabled-veteran", () => {
    const business = businessWithDefaultProfileData({ ownershipTypeIds: ["disabled-veteran"] });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], business);
    expect(results.length).toEqual(3);
    expect(results).toEqual(expect.arrayContaining([cert3, cert4, cert5]));
  });

  it("returns filtered certifications for disabled-veteran / veteran-owned combo", () => {
    const business = businessWithDefaultProfileData({
      ownershipTypeIds: ["veteran-owned", "disabled-veteran"]
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
    const cert6 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5, cert6], business);
    expect(results.length).toEqual(5);
    expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6]));
  });

  it("returns filtered certifications for none ownership types", () => {
    const business = businessWithDefaultProfileData({ ownershipTypeIds: ["none"] });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], business);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert5]));
  });

  it("returns all certifications for empty ownership types", () => {
    const business = businessWithDefaultProfileData({ ownershipTypeIds: [] });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications([cert1, cert2, cert3, cert4, cert5], business);
    expect(results.length).toEqual(5);
    expect(results).toEqual(expect.arrayContaining([cert1, cert2, cert3, cert4, cert5]));
  });

  it("returns filtered certification when number of employees is less than 120", () => {
    const business = businessWithDefaultProfileData({
      existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1)
    });

    const cert1 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
    const results = filterCertifications([cert1], business);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert1]));
  });

  it("returns filtered certification when number of employees is not answered", () => {
    const business = businessWithDefaultProfileData({ existingEmployees: undefined });

    const cert1 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
    const results = filterCertifications([cert1], business);
    expect(results.length).toEqual(1);
    expect(results).toEqual(expect.arrayContaining([cert1]));
  });

  it("returns empty filtered certifications when number of employees is greater than or equal to 120", () => {
    const business = businessWithDefaultProfileData({});

    const cert1 = generateCertification({ isSbe: true });
    const results = filterCertifications([cert1], business);
    expect(results.length).toEqual(0);
    expect(results).toEqual(expect.not.arrayContaining([cert1]));
  });

  it("returns filtered certifications for disabled-veteran / veteran-owned combo and SBE Certification", () => {
    const business = businessWithDefaultProfileData({
      ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
      existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1)
    });

    const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
    const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
    const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
    const cert4 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"] });
    const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
    const cert6 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
    const cert7 = generateCertification({
      isSbe: true,
      applicableOwnershipTypes: ["minority-owned"]
    });
    const cert8 = generateCertification({
      isSbe: true,
      applicableOwnershipTypes: ["veteran-owned"]
    });
    const cert9 = generateCertification({ applicableOwnershipTypes: [] });

    const results = filterCertifications(
      [cert1, cert2, cert3, cert4, cert5, cert6, cert7, cert8, cert9],
      business
    );
    expect(results.length).toEqual(7);
    expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6, cert8, cert9]));
  });
});
