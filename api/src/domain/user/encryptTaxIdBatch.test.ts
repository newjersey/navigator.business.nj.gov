import { generateProfileData, generateUserDataPrime } from "@shared/test";
import { UserDataPrime } from "@shared/userData";
import { EncryptionDecryptionClient, EncryptTaxId, UserDataClient } from "../types";
import { encryptTaxIdBatch } from "./encryptTaxIdBatch";
import { encryptTaxIdFactory } from "./encryptTaxIdFactory";

describe("encryptTaxIdBatch", () => {
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  let encryptTaxId: EncryptTaxId;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubEncryptionDecryptionClient = { encryptValue: jest.fn(), decryptValue: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
    };
    encryptTaxId = encryptTaxIdFactory(stubEncryptionDecryptionClient);
  });

  it("encrypts and masks tax id for users who need it and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserDataPrime): Promise<UserDataPrime> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("some-encrypted-value");

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataPrime({
        profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
      }),
      generateUserDataPrime({
        profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
      }),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserDataPrime): Promise<UserDataPrime> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue
      .mockResolvedValueOnce("some-encrypted-value")
      .mockRejectedValueOnce({});

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataPrime({
        profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
      }),
      generateUserDataPrime({
        profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
      }),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
