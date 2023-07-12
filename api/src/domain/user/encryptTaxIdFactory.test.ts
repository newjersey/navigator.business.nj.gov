import { Business } from "@shared/business";
import { getCurrentBusiness, modifyCurrentBusiness } from "@shared/businessHelpers";
import { generateProfileData, generateUserDataPrime } from "@shared/test";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { encryptTaxIdFactory } from "./encryptTaxIdFactory";

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
    const userData = generateUserDataPrime({
      profileData: generateProfileData({
        taxId: "123456789000",
        encryptedTaxId: undefined,
      }),
    });
    const response = await encryptTaxId(userData);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith("123456789000");
    const currentBusiness = getCurrentBusiness(userData);
    const expectedBusiness: Business = {
      ...currentBusiness,
      profileData: {
        ...currentBusiness.profileData,
        taxId: "*******89000",
        encryptedTaxId: "some-encrypted-value",
      },
    };
    const expectedUserData = modifyCurrentBusiness(userData, expectedBusiness);
    expect(response).toEqual(expectedUserData);
  });
});
