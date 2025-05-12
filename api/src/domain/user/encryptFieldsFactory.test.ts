import { EncryptionDecryptionClient, EncryptTaxId } from "@domain/types";
import { encryptFieldsFactory } from "@domain/user/encryptFieldsFactory";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { generateBusiness, generateProfileData, generateUserDataForBusiness } from "@shared/test";

describe("encryptFieldsFactory", () => {
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  let encryptTaxId: EncryptTaxId;
  const numFieldsToEncrypt = 2;
  const taxId = "123456789000";
  const taxPin = "1234";

  beforeEach(async () => {
    jest.resetAllMocks();
    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn((valueToBeEncrypted: string) => {
        const encryptedValues: { [key: string]: string } = {
          "123456789000": "encrypted-tax-id",
          "1234": "encrypted-tax-pin",
        };
        return Promise.resolve(encryptedValues[valueToBeEncrypted] ?? "unexpected value");
      }),
      decryptValue: jest.fn(),
    };
    encryptTaxId = encryptFieldsFactory(stubEncryptionDecryptionClient);
  });

  it("updates user by masking and encrypting tax id and tax pin", async () => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          taxId: taxId,
          encryptedTaxId: undefined,
          taxPin: taxPin,
          encryptedTaxPin: undefined,
        }),
      }),
    );
    const response = await encryptTaxId(userData);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith(taxId);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith(taxPin);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt);

    const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      profileData: {
        ...business.profileData,
        taxId: "*******89000",
        encryptedTaxId: "encrypted-tax-id",
        taxPin: "****",
        encryptedTaxPin: "encrypted-tax-pin",
      },
    }));
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt tax id if it is already masked", async () => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          taxId: "*******89000",
          encryptedTaxId: "already-encrypted",
          taxPin: taxPin,
          encryptedTaxPin: undefined,
        }),
      }),
    );
    const response = await encryptTaxId(userData);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith(taxPin);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledTimes(
      numFieldsToEncrypt - 1,
    );

    const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      profileData: {
        ...business.profileData,
        taxPin: "****",
        encryptedTaxPin: "encrypted-tax-pin",
      },
    }));
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt tax pin if it is already masked", async () => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          taxId: taxId,
          encryptedTaxId: undefined,
          taxPin: "****",
          encryptedTaxPin: "already-encrypted",
        }),
      }),
    );
    const response = await encryptTaxId(userData);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledWith(taxId);
    expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledTimes(
      numFieldsToEncrypt - 1,
    );

    const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      profileData: {
        ...business.profileData,
        taxId: "*******89000",
        encryptedTaxId: "encrypted-tax-id",
      },
    }));
    expect(response).toEqual(expectedUserData);
  });
});
