import {generatev155Business, generatev155UserData} from "@db/migrations/v155_add_user_id_and_version_to_business";
import {migrate_v155_to_v156} from "@db/migrations/v156_add_tax_clearance_data";

describe("migrate_v155_to_v156", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  it("adds the tax clearance data object to the business object", () => {
    const id = "biz-1";
    const v155Business = generatev155Business({
      id,
    });
    const v155User = generatev155UserData({
      businesses: { "biz-1": v155Business },
    });

    expect(v155User.businesses[id]).not.toContain("taxClearanceData");

    const v156User = migrate_v155_to_v156(v155User);

    expect(v156User.businesses[id].taxClearanceCertificateData).toEqual({
      issuingAgency: undefined,
      businessName: "",
      addressLine1: "",
      addressLine2: "",
      addressCity: "",
      addressState: undefined,
      addressProvince: "",
      addressZipCode: "",
      addressCountry: undefined,
    });
  });
});
