import { v98generatorProfileData, v98UserDataGenerator } from "./v98_add_phase_newly_changed";
import { migrate_v98_to_v99 } from "./v99_added_encrypted_tax_id";

describe("migrate_v98_to_v99", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  it("adds the encryptedTaxId field as undefined", () => {
    const v98 = v98UserDataGenerator({ profileData: v98generatorProfileData({ taxId: undefined }) });
    const v99 = migrate_v98_to_v99(v98);
    expect(v99).toEqual({
      ...v98,
      profileData: {
        ...v98.profileData,
        encryptedId: undefined,
      },
      version: 99,
    });
  });
});
