import { EncryptionDecryptionClient, EncryptTaxId } from "@domain/types";
import { encryptTaxIdFactory } from "@domain/user/encryptTaxIdFactory";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { generateBusiness, generateProfileData, generateUserDataForBusiness } from "@shared/test";

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
    const userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          taxId: "123456789000",
          encryptedTaxId: undefined,
        }),
      })
    );
    const response = await encryptTaxId(userData);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith("123456789000");

    const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      profileData: {
        ...business.profileData,
        taxId: "*******89000",
        encryptedTaxId: "some-encrypted-value",
      },
    }));
    expect(response).toEqual(expectedUserData);
  });
});
