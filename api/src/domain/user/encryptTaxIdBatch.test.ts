import { CryptoClient, EncryptTaxId, UserDataClient } from "@domain/types";
import { encryptTaxIdForBatchLambdaFactory } from "@domain/user/encryptFieldsFactory";
import { encryptTaxIdBatch } from "@domain/user/encryptTaxIdBatch";
import { generateBusiness, generateProfileData, generateUserDataForBusiness } from "@shared/test";
import { UserData } from "@shared/userData";

describe("encryptTaxIdBatch", () => {
  let stubCryptoClient: jest.Mocked<CryptoClient>;
  let encryptTaxId: EncryptTaxId;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubCryptoClient = { encryptValue: jest.fn(), decryptValue: jest.fn(), hashValue: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
      getUsersWithOutdatedVersion: jest.fn(),
    };
    encryptTaxId = encryptTaxIdForBatchLambdaFactory(stubCryptoClient);
  });

  it("encrypts and masks tax id for users who need it and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubCryptoClient.encryptValue.mockResolvedValue("some-encrypted-value");

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
        }),
      ),
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
        }),
      ),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubCryptoClient.encryptValue
      .mockResolvedValueOnce("some-encrypted-value")
      .mockRejectedValueOnce({});

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
        }),
      ),
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
        }),
      ),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
