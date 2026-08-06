import {
  ForeignEnvironmentCiphertextError,
  QuarantinedCiphertextError,
  type CryptoClient,
  isQuarantinedCiphertextError,
} from "@domain/types";
import {
  generatev193Business,
  generatev193CigaretteLicenseData,
  generatev193ProfileData,
  generatev193TaxClearanceCertificateData,
  generatev193UserData,
} from "@db/migrations/v193_rotate_stranded_legacy_kms_fields";
import { type MigrationClients } from "@db/migrations/types";
import { migrate_v193_to_v194 } from "@db/migrations/v194_rotate_or_reset_foreign_kms_fields";

const makeCryptoClient = (): jest.Mocked<CryptoClient> => ({
  decryptValue: jest.fn(async (value) => `plain:${value}`),
  encryptValue: jest.fn(async (value) => `current:${value}`),
  hashValue: jest.fn(),
});

describe("migrate_v193_to_v194", () => {
  let cryptoClient: jest.Mocked<CryptoClient>;
  let clients: MigrationClients;

  beforeEach(() => {
    cryptoClient = makeCryptoClient();
    clients = { cryptoClient };
  });

  it("rotates every persisted encrypted field", async () => {
    const result = await migrate_v193_to_v194(
      generatev193UserData({
        businesses: {
          first: generatev193Business({
            id: "first",
            profileData: generatev193ProfileData({
              encryptedTaxId: "profile-tax-id",
              encryptedTaxPin: "profile-tax-pin",
              deptOfLaborEin: "dol-ein",
            }),
            cigaretteLicenseData: generatev193CigaretteLicenseData({
              encryptedTaxId: "cigarette-tax-id",
            }),
            taxClearanceCertificateData: generatev193TaxClearanceCertificateData({
              encryptedTaxId: "clearance-tax-id",
              encryptedTaxPin: "clearance-tax-pin",
            }),
          }),
        },
      }),
      clients,
    );
    const business = result.businesses.first;

    expect(result.version).toBe(194);
    expect(business.version).toBe(194);
    expect(business.profileData.encryptedTaxId).toBe("current:plain:profile-tax-id");
    expect(business.profileData.encryptedTaxPin).toBe("current:plain:profile-tax-pin");
    expect(business.profileData.deptOfLaborEin).toBe("current:plain:dol-ein");
    expect(business.cigaretteLicenseData?.encryptedTaxId).toBe("current:plain:cigarette-tax-id");
    expect(business.taxClearanceCertificateData?.encryptedTaxId).toBe(
      "current:plain:clearance-tax-id",
    );
    expect(business.taxClearanceCertificateData?.encryptedTaxPin).toBe(
      "current:plain:clearance-tax-pin",
    );
  });

  it("resets foreign-environment values and their related derived fields", async () => {
    cryptoClient.decryptValue.mockRejectedValue(new ForeignEnvironmentCiphertextError());
    const result = await migrate_v193_to_v194(
      generatev193UserData({
        businesses: {
          first: generatev193Business({
            id: "first",
            profileData: generatev193ProfileData({
              taxId: "*********123",
              hashedTaxId: "source-environment-hash",
              encryptedTaxId: "foreign-profile-tax-id",
              taxPin: "****",
              encryptedTaxPin: "foreign-profile-tax-pin",
              deptOfLaborEin: "foreign-dol-ein",
            }),
            cigaretteLicenseData: generatev193CigaretteLicenseData({
              taxId: "*********123",
              encryptedTaxId: "foreign-cigarette-tax-id",
            }),
            taxClearanceCertificateData: generatev193TaxClearanceCertificateData({
              taxId: "*********123",
              encryptedTaxId: "foreign-clearance-tax-id",
              taxPin: "****",
              encryptedTaxPin: "foreign-clearance-tax-pin",
            }),
          }),
        },
      }),
      clients,
    );
    const business = result.businesses.first;

    expect(business.profileData).toEqual(
      expect.objectContaining({
        taxId: undefined,
        hashedTaxId: undefined,
        encryptedTaxId: undefined,
        taxPin: undefined,
        encryptedTaxPin: undefined,
        deptOfLaborEin: "",
      }),
    );
    expect(business.cigaretteLicenseData).toEqual(
      expect.objectContaining({ taxId: undefined, encryptedTaxId: undefined }),
    );
    expect(business.taxClearanceCertificateData).toEqual(
      expect.objectContaining({
        taxId: undefined,
        encryptedTaxId: undefined,
        taxPin: undefined,
        encryptedTaxPin: undefined,
      }),
    );
    expect(cryptoClient.encryptValue).not.toHaveBeenCalled();
  });

  it("preserves quarantinable errors through migration context", async () => {
    cryptoClient.decryptValue.mockRejectedValue(
      new QuarantinedCiphertextError("Ciphertext wrapping key is not accepted"),
    );

    let thrownError: unknown;
    try {
      await migrate_v193_to_v194(
        generatev193UserData({
          businesses: {
            first: generatev193Business({
              profileData: generatev193ProfileData({ encryptedTaxId: "unknown-key-value" }),
            }),
          },
        }),
        clients,
      );
    } catch (error) {
      thrownError = error;
    }

    expect(isQuarantinedCiphertextError(thrownError)).toBe(true);
  });
});
