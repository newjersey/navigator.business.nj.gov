import {
  generatev190Business,
  generatev190ProfileData,
  generatev190UserData,
} from "@db/migrations/v190_remove_hidden_fundings_and_certifications";
import { migrate_v190_to_v191 } from "@db/migrations/v191_rotate_new_kms_keys";
import {
  generatev191Business,
  generatev191ProfileData,
  generatev191UserData,
} from "@db/migrations/v191_rotate_new_kms_keys";
import { migrate_v191_to_v192 } from "@db/migrations/v192_fix_confirmation_email_sent_typo";
import { type CryptoClient, ForeignEnvironmentCiphertextError } from "@domain/types";

const makeCryptoClient = (): jest.Mocked<CryptoClient> => ({
  decryptValue: jest.fn(async (value) => `plain:${value}`),
  encryptValue: jest.fn(async (value) => `current:${value}`),
  hashValue: jest.fn(),
});

describe("migrate_v190_to_v191 hashing", () => {
  it("resets a foreign tax ID instead of failing the version-190 migration", async () => {
    const cryptoClient = makeCryptoClient();
    cryptoClient.decryptValue.mockRejectedValue(new ForeignEnvironmentCiphertextError());
    const userData = generatev190UserData({
      businesses: {
        first: generatev190Business({
          id: "first",
          profileData: generatev190ProfileData({
            taxId: "*********123",
            hashedTaxId: "foreign-environment-hash",
            encryptedTaxId: "foreign-tax-id",
          }),
        }),
      },
    });

    const result = await migrate_v190_to_v191(userData, { cryptoClient });

    expect(result.businesses.first.profileData).toEqual(
      expect.objectContaining({
        taxId: undefined,
        hashedTaxId: undefined,
        encryptedTaxId: undefined,
      }),
    );
  });

  it("retries hashing up to three total attempts", async () => {
    const cryptoClient = makeCryptoClient();
    const hashingClient = makeCryptoClient();
    const logger = { LogError: jest.fn() };
    hashingClient.hashValue
      .mockRejectedValueOnce(new Error("temporary hashing failure"))
      .mockRejectedValueOnce(new Error("temporary hashing failure"))
      .mockResolvedValueOnce("hashed-tax-id");
    const userData = generatev190UserData({
      businesses: {
        first: generatev190Business({
          id: "first",
          profileData: generatev190ProfileData({ encryptedTaxId: "encrypted-tax-id" }),
        }),
      },
    });

    const result = await migrate_v190_to_v191(userData, {
      cryptoClient,
      newHashingClient: hashingClient,
      logger,
    });

    expect(result.businesses.first.profileData.hashedTaxId).toBe("hashed-tax-id");
    expect(hashingClient.hashValue).toHaveBeenCalledTimes(3);
    expect(logger.LogError).toHaveBeenCalledTimes(2);
    expect(logger.LogError).toHaveBeenLastCalledWith(
      expect.stringContaining("attempt 2 of 3: Error: temporary hashing failure"),
    );
  });

  it("fails the migration after the third hashing failure", async () => {
    const cryptoClient = makeCryptoClient();
    const hashingClient = makeCryptoClient();
    const logger = { LogError: jest.fn() };
    hashingClient.hashValue.mockRejectedValue(new Error("terminal hashing failure"));
    const userData = generatev190UserData({
      businesses: {
        first: generatev190Business({
          id: "first",
          profileData: generatev190ProfileData({ encryptedTaxId: "encrypted-tax-id" }),
        }),
      },
    });

    await expect(
      migrate_v190_to_v191(userData, {
        cryptoClient,
        newHashingClient: hashingClient,
        logger,
      }),
    ).rejects.toThrow("terminal hashing failure");
    expect(hashingClient.hashValue).toHaveBeenCalledTimes(3);
    expect(logger.LogError).toHaveBeenCalledTimes(3);
  });
});

describe("migrate_v191_to_v192 hashing", () => {
  it("retries hashing up to three total attempts", async () => {
    const cryptoClient = makeCryptoClient();
    const hashingClient = makeCryptoClient();
    const logger = { LogError: jest.fn() };
    hashingClient.hashValue
      .mockRejectedValueOnce(new Error("temporary hashing failure"))
      .mockRejectedValueOnce(new Error("temporary hashing failure"))
      .mockResolvedValueOnce("hashed-tax-id");
    const userData = generatev191UserData({
      businesses: {
        first: generatev191Business({
          id: "first",
          profileData: generatev191ProfileData({ encryptedTaxId: "encrypted-tax-id" }),
        }),
      },
    });

    const result = await migrate_v191_to_v192(userData, {
      cryptoClient,
      newHashingClient: hashingClient,
      logger,
    });

    expect(result.businesses.first.profileData.hashedTaxId).toBe("hashed-tax-id");
    expect(hashingClient.hashValue).toHaveBeenCalledTimes(3);
    expect(logger.LogError).toHaveBeenCalledTimes(2);
    expect(logger.LogError).toHaveBeenLastCalledWith(
      expect.stringContaining("attempt 2 of 3: Error: temporary hashing failure"),
    );
  });

  it("fails the migration after the third hashing failure", async () => {
    const cryptoClient = makeCryptoClient();
    const hashingClient = makeCryptoClient();
    const logger = { LogError: jest.fn() };
    hashingClient.hashValue.mockRejectedValue(new Error("terminal hashing failure"));
    const userData = generatev191UserData({
      businesses: {
        first: generatev191Business({
          id: "first",
          profileData: generatev191ProfileData({ encryptedTaxId: "encrypted-tax-id" }),
        }),
      },
    });

    await expect(
      migrate_v191_to_v192(userData, {
        cryptoClient,
        newHashingClient: hashingClient,
        logger,
      }),
    ).rejects.toThrow("terminal hashing failure");
    expect(hashingClient.hashValue).toHaveBeenCalledTimes(3);
    expect(logger.LogError).toHaveBeenCalledTimes(3);
  });
});
