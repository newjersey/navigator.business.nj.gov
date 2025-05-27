import { CryptoClient, EncryptTaxId } from "@domain/types";
import { encryptFieldsFactory } from "@domain/user/encryptFieldsFactory";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  generateBusiness,
  generateProfileData,
  generateTaxClearanceCertificateData,
  generateUserDataForBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";

describe("encryptFieldsFactory", () => {
  let stubCryptoEncryptionClient: jest.Mocked<CryptoClient>;
  let stubCryptoHashingClient: jest.Mocked<CryptoClient>;
  let encryptTaxId: EncryptTaxId;
  const numFieldsToEncrypt = 4;
  const profileTaxId = "123456789000";
  const profileTaxPin = "1234";
  const taxClearanceTaxId = "111111111111";
  const taxClearanceTaxPin = "1111";
  const encryptedProfileTaxId = "encrypted-123456789000";
  const encryptedProfileTaxPin = "encrypted-1234";
  const encryptedTaxClearanceTaxId = "encrypted-111111111111";
  const encryptedTaxClearanceTaxPin = "encrypted-1111";

  const generateUnencryptedUserData = (
    profileDataOverrides = {},
    taxClearanceCertificateDataOverrides = {},
  ): UserData => {
    return generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          taxId: profileTaxId,
          encryptedTaxId: undefined,
          taxPin: profileTaxPin,
          encryptedTaxPin: undefined,
          ...profileDataOverrides,
        }),
        taxClearanceCertificateData: generateTaxClearanceCertificateData({
          taxId: taxClearanceTaxId,
          encryptedTaxId: undefined,
          taxPin: taxClearanceTaxPin,
          encryptedTaxPin: undefined,
          ...taxClearanceCertificateDataOverrides,
        }),
      }),
    );
  };

  const getExpectedEncryptedCurrentBusiness = (
    userData: UserData,
    profileDataOverrides = {},
    taxClearanceCertificateDataOverrides = {},
  ): UserData => {
    const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      profileData: {
        ...business.profileData,
        taxId: "*******89000",
        encryptedTaxId: encryptedProfileTaxId,
        taxPin: "****",
        encryptedTaxPin: encryptedProfileTaxPin,
        ...profileDataOverrides,
      },
      taxClearanceCertificateData: business.taxClearanceCertificateData
        ? {
            ...business.taxClearanceCertificateData,
            taxId: "*******11111",
            encryptedTaxId: encryptedTaxClearanceTaxId,
            taxPin: "****",
            encryptedTaxPin: encryptedTaxClearanceTaxPin,
            ...taxClearanceCertificateDataOverrides,
          }
        : undefined,
    }));
    return expectedUserData;
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    stubCryptoEncryptionClient = {
      encryptValue: jest.fn((valueToBeEncrypted: string) => {
        const encryptedValues: { [key: string]: string } = {
          [profileTaxId]: encryptedProfileTaxId,
          [profileTaxPin]: encryptedProfileTaxPin,
          [taxClearanceTaxId]: encryptedTaxClearanceTaxId,
          [taxClearanceTaxPin]: encryptedTaxClearanceTaxPin,
        };
        return Promise.resolve(encryptedValues[valueToBeEncrypted] ?? "unexpected value");
      }),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };

    stubCryptoHashingClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    encryptTaxId = encryptFieldsFactory(stubCryptoEncryptionClient, stubCryptoHashingClient);
  });

  it("updates user by masking and encrypting tax id and tax pin", async () => {
    const userData = generateUnencryptedUserData();
    const response = await encryptTaxId(userData);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt);

    const expectedUserData = getExpectedEncryptedCurrentBusiness(userData);
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt profile tax id if it is already masked", async () => {
    const userData = generateUnencryptedUserData({
      taxId: "*******89000",
      encryptedTaxId: "already-encrypted",
    });
    const response = await encryptTaxId(userData);
    expect(stubCryptoEncryptionClient.encryptValue).not.toHaveBeenCalledWith(profileTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt - 1);

    const expectedUserData = getExpectedEncryptedCurrentBusiness(userData, {
      taxId: "*******89000",
      encryptedTaxId: "already-encrypted",
    });
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt profile tax pin if it is already masked", async () => {
    const userData = generateUnencryptedUserData({
      taxPin: "****",
      encryptedTaxPin: "already-encrypted",
    });
    const response = await encryptTaxId(userData);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).not.toHaveBeenCalledWith(profileTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt - 1);

    const expectedUserData = getExpectedEncryptedCurrentBusiness(userData, {
      taxPin: "****",
      encryptedTaxPin: "already-encrypted",
    });
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt tax clearance tax id if it is already masked", async () => {
    const userData = generateUnencryptedUserData(
      {},
      {
        taxId: "*******89000",
        encryptedTaxId: "already-encrypted",
      },
    );
    const response = await encryptTaxId(userData);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).not.toHaveBeenCalledWith(taxClearanceTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt - 1);

    const expectedUserData = getExpectedEncryptedCurrentBusiness(
      userData,
      {},
      {
        taxId: "*******89000",
        encryptedTaxId: "already-encrypted",
      },
    );
    expect(response).toEqual(expectedUserData);
  });

  it("does not encrypt tax clearance tax pin if it is already masked", async () => {
    const userData = generateUnencryptedUserData(
      {},
      {
        taxPin: "****",
        encryptedTaxPin: "already-encrypted",
      },
    );
    const response = await encryptTaxId(userData);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(profileTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledWith(taxClearanceTaxId);
    expect(stubCryptoEncryptionClient.encryptValue).not.toHaveBeenCalledWith(taxClearanceTaxPin);
    expect(stubCryptoEncryptionClient.encryptValue).toHaveBeenCalledTimes(numFieldsToEncrypt - 1);

    const expectedUserData = getExpectedEncryptedCurrentBusiness(
      userData,
      {},
      {
        taxPin: "****",
        encryptedTaxPin: "already-encrypted",
      },
    );
    expect(response).toEqual(expectedUserData);
  });
});
