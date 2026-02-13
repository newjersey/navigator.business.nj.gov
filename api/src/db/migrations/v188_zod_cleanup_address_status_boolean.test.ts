import { migrate_v187_to_v188 } from "@db/migrations/v188_zod_cleanup_address_status_boolean";
import {
  generatev187Business,
  generatev187ProfileData,
  generatev187UserData,
} from "@db/migrations/v187_add_crtk_data";

describe("migrate_v187_to_v188", () => {
  it("set dateDeletedISO, deptOfLaborEin, addressLine1, addressLine2, and addressZipCode to empty string", async () => {
    const tempUserData = generatev187UserData({
      businesses: {
        "123": generatev187Business({
          id: "123",
          profileData: generatev187ProfileData({}),
        }),
      },
    });

    // Simulate old data with missing properties by building object without them
    const business = tempUserData.businesses["123"];

    // Remove dateDeletedISO from business
    const businessWithoutDateDeleted = Object.fromEntries(
      Object.entries(business).filter(([key]) => key !== "dateDeletedISO"),
    );

    // Remove deptOfLaborEin from profileData
    const profileDataWithoutEin = Object.fromEntries(
      Object.entries(business.profileData).filter(([key]) => key !== "deptOfLaborEin"),
    );

    // Remove address fields from formationFormData
    const formDataWithoutAddress = Object.fromEntries(
      Object.entries(business.formationData.formationFormData).filter(
        ([key]) =>
          ![
            "addressLine1",
            "addressLine2",
            "addressZipCode",
            "agentOfficeAddressCity",
            "legalType",
          ].includes(key),
      ),
    );

    // Remove address fields from formationFormData
    const preferencesWithoutHidden = Object.fromEntries(
      Object.entries(business.formationData.formationFormData).filter(
        ([key]) => !["hiddenCertificationIds", "hiddenFundingIds"].includes(key),
      ),
    );

    const v187UserData = {
      ...tempUserData,
      businesses: {
        "123": {
          ...businessWithoutDateDeleted,
          preferences: preferencesWithoutHidden,
          profileData: profileDataWithoutEin,
          formationData: {
            ...business.formationData,
            formationFormData: formDataWithoutAddress,
          },
        },
      },
    } as unknown as ReturnType<typeof generatev187UserData>;

    expect(v187UserData.businesses["123"].dateDeletedISO).not.toBeDefined();
    expect(v187UserData.businesses["123"].profileData.deptOfLaborEin).not.toBeDefined();
    expect(
      v187UserData.businesses["123"].formationData.formationFormData.addressLine1,
    ).not.toBeDefined();
    expect(
      v187UserData.businesses["123"].formationData.formationFormData.addressLine2,
    ).not.toBeDefined();
    expect(
      v187UserData.businesses["123"].formationData.formationFormData.addressZipCode,
    ).not.toBeDefined();

    const v188UserData = migrate_v187_to_v188(v187UserData);
    expect(v188UserData.version).toBe(188);
    expect(v188UserData.businesses["123"].dateDeletedISO).toBe("");
    expect(v188UserData.businesses["123"].profileData.deptOfLaborEin).toBe("");
    expect(v188UserData.businesses["123"].formationData.formationFormData.addressLine1).toBe("");
    expect(v188UserData.businesses["123"].formationData.formationFormData.addressLine2).toBe("");
    expect(v188UserData.businesses["123"].formationData.formationFormData.addressZipCode).toBe("");
  });
});
