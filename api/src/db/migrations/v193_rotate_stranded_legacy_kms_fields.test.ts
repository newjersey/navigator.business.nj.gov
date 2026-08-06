import {
  generatev192Business,
  generatev192CigaretteLicenseData,
  generatev192ProfileData,
  generatev192TaxClearanceCertificateData,
  generatev192UserData,
  type v192TaxClearanceCertificateData,
} from "@db/migrations/v192_fix_confirmation_email_sent_typo";
import { migrate_v192_to_v193 } from "@db/migrations/v193_rotate_stranded_legacy_kms_fields";
import { type MigrationClients } from "@db/migrations/types";
import {
  type CryptoClient,
  ForeignEnvironmentCiphertextError,
  QuarantinedCiphertextError,
  isQuarantinedCiphertextError,
} from "@domain/types";

const makeCryptoClient = (): jest.Mocked<CryptoClient> => ({
  decryptValue: jest.fn(async (value) => `plain:${value}`),
  encryptValue: jest.fn(async (value) => `current:${value}`),
  hashValue: jest.fn(),
});

describe("migrate_v192_to_v193", () => {
  let cryptoClient: jest.Mocked<CryptoClient>;
  let clients: MigrationClients;

  beforeEach(() => {
    cryptoClient = makeCryptoClient();
    clients = { cryptoClient };
  });

  it("requires migration clients", async () => {
    await expect(migrate_v192_to_v193(generatev192UserData({}))).rejects.toThrow(
      "Migration v193 requires migration clients",
    );
  });

  it("rotates all six encrypted fields and updates every business version", async () => {
    const taxClearanceData = {
      ...generatev192TaxClearanceCertificateData({}),
      encryptedTaxId: "tax-clearance-tax-id",
      encryptedTaxPin: "tax-clearance-tax-pin",
    } as v192TaxClearanceCertificateData & {
      encryptedTaxId: string;
      encryptedTaxPin: string;
    };
    const userData = generatev192UserData({
      version: 192,
      businesses: {
        first: generatev192Business({
          id: "first",
          version: 192,
          profileData: generatev192ProfileData({
            encryptedTaxId: "profile-tax-id",
            encryptedTaxPin: "profile-tax-pin",
            deptOfLaborEin: "dol-ein",
          }),
          cigaretteLicenseData: generatev192CigaretteLicenseData({
            encryptedTaxId: "cigarette-tax-id",
            paymentInfo: { confirmationEmailSent: true },
          }),
          taxClearanceCertificateData: taxClearanceData,
        }),
        second: generatev192Business({ id: "second", version: 192 }),
      },
    });

    const result = await migrate_v192_to_v193(userData, clients);
    const first = result.businesses.first;

    expect(result.version).toBe(193);
    expect(first.version).toBe(193);
    expect(result.businesses.second.version).toBe(193);
    expect(first.profileData.encryptedTaxId).toBe("current:plain:profile-tax-id");
    expect(first.profileData.encryptedTaxPin).toBe("current:plain:profile-tax-pin");
    expect(first.profileData.deptOfLaborEin).toBe("current:plain:dol-ein");
    expect(first.cigaretteLicenseData?.encryptedTaxId).toBe("current:plain:cigarette-tax-id");
    expect(first.cigaretteLicenseData?.paymentInfo?.confirmationEmailSent).toBe(true);
    expect(first.taxClearanceCertificateData?.encryptedTaxId).toBe(
      "current:plain:tax-clearance-tax-id",
    );
    expect(first.taxClearanceCertificateData?.encryptedTaxPin).toBe(
      "current:plain:tax-clearance-tax-pin",
    );
  });

  it("leaves missing encrypted fields empty", async () => {
    const userData = generatev192UserData({
      businesses: {
        first: generatev192Business({
          id: "first",
          profileData: generatev192ProfileData({
            encryptedTaxId: undefined,
            encryptedTaxPin: undefined,
            deptOfLaborEin: "",
          }),
          cigaretteLicenseData: undefined,
          taxClearanceCertificateData: undefined,
        }),
      },
    });

    const result = await migrate_v192_to_v193(userData, clients);

    expect(result.businesses.first.profileData.encryptedTaxId).toBeUndefined();
    expect(result.businesses.first.profileData.encryptedTaxPin).toBeUndefined();
    expect(result.businesses.first.profileData.deptOfLaborEin).toBe("");
  });

  it("resets foreign-environment values and their related derived fields", async () => {
    cryptoClient.decryptValue.mockRejectedValue(new ForeignEnvironmentCiphertextError());
    const taxClearanceData = {
      ...generatev192TaxClearanceCertificateData({
        taxId: "*********123",
        taxPin: "****",
      }),
      encryptedTaxId: "foreign-clearance-tax-id",
      encryptedTaxPin: "foreign-clearance-tax-pin",
    } as v192TaxClearanceCertificateData & {
      encryptedTaxId: string;
      encryptedTaxPin: string;
    };
    const userData = generatev192UserData({
      businesses: {
        first: generatev192Business({
          id: "first",
          profileData: generatev192ProfileData({
            taxId: "*********123",
            hashedTaxId: "source-environment-hash",
            encryptedTaxId: "foreign-profile-tax-id",
            taxPin: "****",
            encryptedTaxPin: "foreign-profile-tax-pin",
            deptOfLaborEin: "foreign-dol-ein",
          }),
          cigaretteLicenseData: generatev192CigaretteLicenseData({
            taxId: "*********123",
            encryptedTaxId: "foreign-cigarette-tax-id",
          }),
          taxClearanceCertificateData: taxClearanceData,
        }),
      },
    });

    const result = await migrate_v192_to_v193(userData, clients);
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
    const userData = generatev192UserData({
      businesses: {
        first: generatev192Business({
          profileData: generatev192ProfileData({ encryptedTaxId: "unknown-key-value" }),
        }),
      },
    });

    let thrownError: unknown;
    try {
      await migrate_v192_to_v193(userData, clients);
    } catch (error) {
      thrownError = error;
    }

    expect(isQuarantinedCiphertextError(thrownError)).toBe(true);
  });

  it.each([
    ["decrypt", "AccessDeniedException"],
    ["decrypt", "unencryptedDataKey has not been set"],
    ["decrypt", "Invalid ciphertext"],
    ["decrypt", "ThrottlingException"],
    ["decrypt", "TimeoutError"],
    ["encrypt", "KMS encryption failed"],
  ])("rejects without mutating source data when %s fails with %s", async (operation, message) => {
    const userData = generatev192UserData({
      businesses: {
        first: generatev192Business({
          id: "first",
          profileData: generatev192ProfileData({ encryptedTaxId: "encrypted-value" }),
        }),
      },
    });
    const original = structuredClone(userData);
    const method = operation === "decrypt" ? cryptoClient.decryptValue : cryptoClient.encryptValue;
    method.mockRejectedValueOnce(new Error(message));

    await expect(migrate_v192_to_v193(userData, clients)).rejects.toThrow(
      `Migration v193 failed to ${operation} profileData.encryptedTaxId: ${message}`,
    );
    expect(userData).toEqual(original);
  });
});
