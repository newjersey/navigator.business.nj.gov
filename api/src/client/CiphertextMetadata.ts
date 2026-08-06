import { NodeAlgorithmSuite } from "@aws-crypto/material-management-node";
import { deserializeFactory } from "@aws-crypto/serialize";
import { fromBase64 } from "@aws-sdk/util-base64-node";
import { ForeignEnvironmentCiphertextError, QuarantinedCiphertextError } from "@domain/types";
import { TextDecoder } from "node:util";

export type ForeignEnvironmentPolicy = "reset" | "quarantine";

export interface EncryptionContext {
  readonly stage: string;
  readonly purpose: string;
  readonly origin: string;
}

export interface CiphertextValidationOptions {
  readonly allowedKeyIds: readonly string[];
  readonly acceptedContexts: readonly EncryptionContext[];
  readonly foreignEnvironmentPolicy: ForeignEnvironmentPolicy;
}

export interface CiphertextMetadata {
  readonly encryptionContext: Readonly<Record<string, string>>;
  readonly keyIds: readonly string[];
}

const decoder = new TextDecoder();
const { deserializeMessageHeader } = deserializeFactory(
  (input): string => decoder.decode(input),
  NodeAlgorithmSuite,
);

const contextMatches = (
  actualContext: Readonly<Record<string, string>>,
  expectedContext: EncryptionContext,
): boolean => Object.entries(expectedContext).every(([key, value]) => actualContext[key] === value);

const parseCiphertextMetadata = (encryptedValue: string): CiphertextMetadata => {
  try {
    const header = deserializeMessageHeader(fromBase64(encryptedValue));
    if (!header) {
      throw new Error("Ciphertext header is incomplete");
    }

    return {
      encryptionContext: header.messageHeader.encryptionContext,
      keyIds: header.messageHeader.encryptedDataKeys.map((dataKey) =>
        dataKey.providerInfo.toString(),
      ),
    };
  } catch (error) {
    throw new QuarantinedCiphertextError("Ciphertext header is malformed", { cause: error });
  }
};

export const validateParsedCiphertextMetadata = (
  metadata: CiphertextMetadata,
  options: CiphertextValidationOptions,
): void => {
  const contextIsAccepted = options.acceptedContexts.some((acceptedContext) =>
    contextMatches(metadata.encryptionContext, acceptedContext),
  );

  if (!contextIsAccepted) {
    const actualStage = metadata.encryptionContext.stage;
    const acceptedStages = new Set(options.acceptedContexts.map(({ stage }) => stage));
    const hasKnownForeignStage =
      typeof actualStage === "string" && !acceptedStages.has(actualStage);

    if (hasKnownForeignStage && options.foreignEnvironmentPolicy === "reset") {
      throw new ForeignEnvironmentCiphertextError();
    }

    throw new QuarantinedCiphertextError("Ciphertext encryption context is not accepted");
  }

  const allowedKeyIds = new Set(options.allowedKeyIds);
  if (!metadata.keyIds.some((keyId) => allowedKeyIds.has(keyId))) {
    throw new QuarantinedCiphertextError("Ciphertext wrapping key is not accepted");
  }
};

export const validateCiphertextMetadata = (
  encryptedValue: string,
  options: CiphertextValidationOptions,
): void => validateParsedCiphertextMetadata(parseCiphertextMetadata(encryptedValue), options);
