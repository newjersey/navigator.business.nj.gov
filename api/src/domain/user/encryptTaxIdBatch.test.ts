import { UserData } from "@shared/userData";
import { generateProfileData, generateUserData } from "../../../test/factories";
import { EncryptionDecryptionClient, EncryptTaxId, UserDataClient, UserDataQlClient } from "../types";
import { encryptTaxIdBatch } from "./encryptTaxIdBatch";
import { encryptTaxIdFactory } from "./encryptTaxIdFactory";

describe("encryptTaxIdBatch", () => {
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  let encryptTaxId: EncryptTaxId;
  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUserDataQlClient: jest.Mocked<UserDataQlClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubEncryptionDecryptionClient = { encryptValue: jest.fn(), decryptValue: jest.fn() };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubUserDataQlClient = {
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
      search: jest.fn(),
    };
    encryptTaxId = encryptTaxIdFactory(stubEncryptionDecryptionClient);
  });

  it("encrypts and masks tax id for users who need it and returns success, failed, and total count when all succeed", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("some-encrypted-value");

    stubUserDataQlClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserData({
        profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
      }),
      generateUserData({
        profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
      }),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 2, failed: 0 });
  });

  it("does not stop execution if one fails", async () => {
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
    stubEncryptionDecryptionClient.encryptValue
      .mockResolvedValueOnce("some-encrypted-value")
      .mockRejectedValueOnce({});

    stubUserDataQlClient.getNeedTaxIdEncryptionUsers.mockResolvedValue([
      generateUserData({
        profileData: generateProfileData({ taxId: "123456789000", encryptedTaxId: undefined }),
      }),
      generateUserData({
        profileData: generateProfileData({ taxId: "000987654321", encryptedTaxId: undefined }),
      }),
    ]);

    const results = await encryptTaxIdBatch(encryptTaxId, stubUserDataClient, stubUserDataQlClient);
    expect(results).toEqual({ total: 2, success: 1, failed: 1 });
  });
});
