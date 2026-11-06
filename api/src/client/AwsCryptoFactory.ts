import type { NonSharedBuffer } from "node:buffer";
import * as crypto from "node:crypto";
import { TextDecoder } from "node:util";
import * as AWSCrypto from "@aws-crypto/client-node";
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import {
  type EncryptionContext,
  type ForeignEnvironmentPolicy,
  validateCiphertextMetadata,
} from "@client/CiphertextMetadata";
import type { CryptoClient } from "@domain/types";

export interface AWSCryptoFactoryConfig {
  readonly generatorKeyId: string;
  readonly context: EncryptionContext;
  readonly encryptedHashingSalt?: string;
  readonly decryptOnlyKeyIds?: readonly string[];
  readonly decryptOnlyContexts?: readonly EncryptionContext[];
}

export interface AWSCryptoFactoryOptions {
  readonly foreignEnvironmentPolicy?: ForeignEnvironmentPolicy;
}

const contextMatches = (
  actualContext: Record<string, string>,
  expectedContext: EncryptionContext,
): boolean => Object.entries(expectedContext).every(([key, value]) => actualContext[key] === value);

export const cryptoUtils: { pbkdf2: typeof crypto.pbkdf2 } = {
  // biome-ignore lint/complexity/useMaxParams: mirrors node:crypto.pbkdf2 so tests can spy on it
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
  {
    generatorKeyId,
    context,
    encryptedHashingSalt,
    decryptOnlyKeyIds = [],
    decryptOnlyContexts = [],
  }: AWSCryptoFactoryConfig,
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
      // the SDK types this with an index signature, which an interface can't satisfy; a copy can
      encryptionContext: { ...context },
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
        { cause: error },
      );
    }
  };

  return { encryptValue, decryptValue, hashValue };
};
