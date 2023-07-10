import { generateProfileData, generateUserData } from "@shared/test";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { encryptTaxIdFactory } from "./encryptTaxIdFactory";
import { Business } from "@shared/userData";

describe("encryptTaxId", () => {
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  let encryptTaxId: EncryptTaxId;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubEncryptionDecryptionClient = { encryptValue: jest.fn(), decryptValue: jest.fn() };
    encryptTaxId = encryptTaxIdFactory(stubEncryptionDecryptionClient);
    stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("some-encrypted-value");
  });

  it("updates user by masking and encrypting tax id", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        taxId: "123456789000",
        encryptedTaxId: undefined,
      }),
    });
    const currentBusiness = userData.businesses[userData.currentBusinessID]
    const expectedBusiness : Business = {...currentBusiness, profileData: {...currentBusiness.profileData, taxId: "*******89000", encryptedTaxId: "some-encrypted-value"}}
    const response = await encryptTaxId(userData);

    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith("123456789000");
    expect(response).toEqual({
      ...userData,
      businesses: {[userData.currentBusinessID]: expectedBusiness}
    });
  });
});
