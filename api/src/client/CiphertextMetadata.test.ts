import {
  type CiphertextMetadata,
  type CiphertextValidationOptions,
  validateCiphertextMetadata,
  validateParsedCiphertextMetadata,
} from "@client/CiphertextMetadata";
import { ForeignEnvironmentCiphertextError, QuarantinedCiphertextError } from "@domain/types";

const currentKey = "arn:aws:kms:us-east-1:123456789012:key/current";
const legacyKey = "arn:aws:kms:us-east-1:123456789012:key/legacy";
const acceptedContext = {
  stage: "dev",
  purpose: "tax_id_encryption",
  origin: "us-east-1",
};

const metadata = (overrides: Partial<CiphertextMetadata> = {}): CiphertextMetadata => ({
  encryptionContext: acceptedContext,
  keyIds: [currentKey],
  ...overrides,
});

const options = (
  overrides: Partial<CiphertextValidationOptions> = {},
): CiphertextValidationOptions => ({
  allowedKeyIds: [currentKey, legacyKey],
  acceptedContexts: [acceptedContext],
  foreignEnvironmentPolicy: "reset",
  ...overrides,
});

describe("validateParsedCiphertextMetadata", () => {
  it.each([currentKey, legacyKey])("accepts configured wrapping key %s", (keyId) => {
    expect(() =>
      validateParsedCiphertextMetadata(metadata({ keyIds: [keyId] }), options()),
    ).not.toThrow();
  });

  it("requests a reset for a foreign stage in non-production", () => {
    expect(() =>
      validateParsedCiphertextMetadata(
        metadata({
          encryptionContext: { ...acceptedContext, stage: "prod" },
          keyIds: ["arn:aws:kms:us-east-1:999999999999:key/prod"],
        }),
        options(),
      ),
    ).toThrow(ForeignEnvironmentCiphertextError);
  });

  it("quarantines a foreign stage when the policy is fail closed", () => {
    expect(() =>
      validateParsedCiphertextMetadata(
        metadata({ encryptionContext: { ...acceptedContext, stage: "dev" } }),
        options({
          acceptedContexts: [{ ...acceptedContext, stage: "prod" }],
          foreignEnvironmentPolicy: "quarantine",
        }),
      ),
    ).toThrow(QuarantinedCiphertextError);
  });

  it("quarantines an unknown key from an accepted stage", () => {
    expect(() =>
      validateParsedCiphertextMetadata(
        metadata({ keyIds: ["arn:aws:kms:us-east-1:123456789012:key/deleted"] }),
        options(),
      ),
    ).toThrow("Ciphertext wrapping key is not accepted");
  });

  it("accepts the complete historical testing context", () => {
    const historicalContext = {
      stage: "",
      purpose: "tax_id_encryption",
      origin: "",
    };

    expect(() =>
      validateParsedCiphertextMetadata(
        metadata({ encryptionContext: historicalContext, keyIds: [legacyKey] }),
        options({ acceptedContexts: [acceptedContext, historicalContext] }),
      ),
    ).not.toThrow();
  });
});

describe("validateCiphertextMetadata", () => {
  it("quarantines malformed ciphertext", () => {
    expect(() => validateCiphertextMetadata("not-encryption-sdk-ciphertext", options())).toThrow(
      "Ciphertext header is malformed",
    );
  });
});
