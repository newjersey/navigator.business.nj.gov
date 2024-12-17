import { EncryptionDecryptionClient, EncryptTaxId, UserDataClient } from "@domain/types";
import { encryptTaxIdBatch } from "@domain/user/encryptTaxIdBatch";
import { encryptTaxIdFactory } from "@domain/user/encryptTaxIdFactory";
import { generateBusiness, generateProfileData, generateUserDataForBusiness } from "@shared/test";
import { UserData } from "@shared/userData";

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
      getUsersWithOutdatedVersion: jest.fn(),
      queryUsersWithBusinesses: jest.fn(),
    };
    encryptTaxId = encryptTaxIdFactory(stubEncryptionDecryptionClient);
  });

  it("encrypts and masks tax id for users who need it and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("some-encrypted-value");

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
        })
      ),
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
        })
      ),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue
      .mockResolvedValueOnce("some-encrypted-value")
      .mockRejectedValueOnce({});

    stubUserDataClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
        })
      ),
      generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
        })
      ),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
