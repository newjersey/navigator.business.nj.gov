import {
  generatev160Business,
  generatev160ProfileData,
  generatev160UserData,
} from "@db/migrations/v160_add_xray_registration_data";
import { migrate_v160_to_v161 } from "@db/migrations/v161_add_encrypted_tax_pin";
import { EncryptionDecryptionClient } from "@domain/types";

describe("v161 migration encrypts and masks tax pin if defined", () => {
  let encryptionDecryptionClient: EncryptionDecryptionClient;

  beforeEach(() => {
    jest.resetAllMocks();
    encryptionDecryptionClient = {
      encryptValue: jest.fn((value) => {
        return new Promise((resolve) => {
          resolve(`encrypted ${value}`);
        });
      }),
      decryptValue: jest.fn((value) => {
        return new Promise((resolve) => {
          resolve(`decrypted ${value}`);
        });
      }),
    };
  });

  it.each([
    { taxPin: undefined, expectedTaxPin: undefined, expectedEncryptedTaxPin: undefined },
    { taxPin: "1234", expectedTaxPin: "****", expectedEncryptedTaxPin: "encrypted 1234" },
  ])(
    "should encrypt and mask $taxPin correctly",
    async ({ taxPin, expectedTaxPin, expectedEncryptedTaxPin }) => {
      const id = "biz-1";
      const v160UserData = generatev160UserData({
        businesses: {
          id: generatev160Business({
            id,
            profileData: generatev160ProfileData({
              taxPin: taxPin,
            }),
          }),
        },
      });
      const migratedUserData = await migrate_v160_to_v161(v160UserData, {
        encryptionDecryptionClient,
      });

      expect(migratedUserData.version).toBe(161);
      expect(migratedUserData.businesses[id].profileData.taxPin).toEqual(expectedTaxPin);
      expect(migratedUserData.businesses[id].profileData.encryptedTaxPin).toEqual(
        expectedEncryptedTaxPin,
      );
    },
  );
});
