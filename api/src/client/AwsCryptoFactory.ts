// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSCrypto = require("@aws-crypto/client-node");
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import {
  type EncryptionContext,
  type ForeignEnvironmentPolicy,
  validateCiphertextMetadata,
} from "@client/CiphertextMetadata";
import { type CryptoClient } from "@domain/types";
import { type NonSharedBuffer } from "node:buffer";
import * as crypto from "node:crypto";
import { TextDecoder } from "node:util";

export interface AWSCryptoFactoryOptions {
  readonly foreignEnvironmentPolicy?: ForeignEnvironmentPolicy;
}

const contextMatches = (
  actualContext: Record<string, string>,
  expectedContext: EncryptionContext,
): boolean => Object.entries(expectedContext).every(([key, value]) => actualContext[key] === value);

export const cryptoUtils: { pbkdf2: typeof crypto.pbkdf2 } = {
  pbkdf2: (
    password: crypto.BinaryLike,
    salt: crypto.BinaryLike,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: NonSharedBuffer) => void,
  ) => {
    return crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
  },
};

export const AWSCryptoFactory = (
  generatorKeyId: string,
  context: EncryptionContext,
  encryptedHashingSalt?: string,
  decryptOnlyKeyIds: readonly string[] = [],
  decryptOnlyContexts: readonly EncryptionContext[] = [],
  options: AWSCryptoFactoryOptions = {},
): CryptoClient => {
  const { encrypt, decrypt } = AWSCrypto.buildClient(
    AWSCrypto.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
  );
  const encryptKeyring = new AWSCrypto.KmsKeyringNode({ generatorKeyId });
  const allowedKeyIds = [...new Set([generatorKeyId, ...decryptOnlyKeyIds].filter(Boolean))];
  const decryptKeyring = new AWSCrypto.KmsKeyringNode({ keyIds: allowedKeyIds });

  const decoder = new TextDecoder();

  const encryptValue = async (plainTextValue: string): Promise<string> => {
    const { result } = await encrypt(encryptKeyring, plainTextValue, {
      encryptionContext: context,
    });
    const base64Value = toBase64(result);
    return base64Value;
  };

  const decryptValue = async (encryptedValue: string): Promise<string> => {
    const acceptedContexts = [context, ...decryptOnlyContexts];
    if (options.foreignEnvironmentPolicy) {
      validateCiphertextMetadata(encryptedValue, {
        allowedKeyIds,
        acceptedContexts,
        foreignEnvironmentPolicy: options.foreignEnvironmentPolicy,
      });
    }

    const bufferedValue = fromBase64(encryptedValue);

    const { plaintext, messageHeader } = await decrypt(decryptKeyring, bufferedValue);

    const { encryptionContext } = messageHeader;

    if (
      !acceptedContexts.some((acceptedContext) =>
        contextMatches(encryptionContext, acceptedContext),
      )
    ) {
      throw new Error("Encryption Context does not match expected values");
    }

    const decodedValue = decoder.decode(plaintext);
    return decodedValue;
  };

  const hashValue = async (
    valueToBeHashed: string,
    _iterationsOverride?: number,
  ): Promise<string> => {
    if (!valueToBeHashed || typeof valueToBeHashed !== "string") {
      throw new Error("Sensitive data must be a non-empty string");
    }
    const normalizedString = valueToBeHashed.replaceAll(/[^\dA-Za-z]/g, "");

    if (!encryptedHashingSalt) {
      throw new Error("Salt must be provided");
    }

    // const decryptedSalt = await decryptValue(encryptedHashingSalt);
    const iterations = _iterationsOverride || 100000;

    try {
      const hash = await new Promise<string>((resolve, reject) => {
        cryptoUtils.pbkdf2(
          normalizedString,
          // decryptedSalt,
          encryptedHashingSalt,
          iterations,
          64,
          "sha3-512",
          (err: Error | null, key: Buffer) => {
            if (err) reject(err);
            else resolve(key.toString("hex"));
          },
        );
      });

      return hash;
    } catch (error) {
      throw new Error(
        `Hash generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return { encryptValue, decryptValue, hashValue };
};
