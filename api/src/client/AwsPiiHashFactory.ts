// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSCrypto = require("@aws-crypto/client-node");
import { fromBase64 } from "@aws-sdk/util-base64-node";
import { PiiHashClient } from "@domain/types";
import { Buffer } from "node:buffer";
import * as crypto from "node:crypto";

export interface PIIHashOptions {
  applicationSalt: string;
}
export const AwsPiiHashFactory = (
  generatorKeyId: string,
  iterationsOverride?: number,
): PiiHashClient => {
  /**
   * Creates a cryptographically secure hash of a sensitive identifier that is:
   *
   * - Deterministic (same input always produces same hash)
   * - One-way (cannot be reversed to obtain original value)
   * - Suitable for database indexing (e.g., DynamoDB GSI)
   * - Resistant to brute force and rainbow table attacks
   *
   * @param sensitiveString - The sensitive data string to hash (e.g., SSN, Tax ID)
   * @param options - Configuration options for the hashing process
   * @returns Promise resolving to a hex string hash
   * @throws Error if operations fail or if inputs are invalid
   */

  const hashValue = async (valueToBeHashed: string, options: PIIHashOptions): Promise<string> => {
    if (!valueToBeHashed || typeof valueToBeHashed !== "string") {
      throw new Error("Sensitive data must be a non-empty string");
    }
    const normalizedString = valueToBeHashed.replaceAll(/[^\dA-Za-z]/g, "");
    const applicationSalt = options.applicationSalt;

    if (!applicationSalt) {
      throw new Error(
        "Application salt must be provided in options or as PII_HASH_SALT environment variable",
      );
    }

    const kmsKeyId = generatorKeyId;

    if (!kmsKeyId) {
      throw new Error("KMS Key ID is required when using an encrypted salt");
    }

    const decryptedSalt = await decryptSaltWithKms(applicationSalt, kmsKeyId);
    console.log({ decryptedSalt });

    const iterations = iterationsOverride || 100000;

    try {
      // Use PBKDF2 with the application salt and SHA3-512
      const hash = await new Promise<string>((resolve, reject) => {
        crypto.pbkdf2(
          normalizedString,
          decryptedSalt,
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

  /**
   * Decrypts an encrypted salt value using AWS KMS
   *
   * @param encryptedSalt - Base64-encoded encrypted salt
   * @param kmsKeyId - KMS Key ID to use for decryption
   * @returns Promise resolving to the decrypted salt
   * @throws Error if KMS decryption fails
   */
  const decryptSaltWithKms = async (encryptedSalt: string, kmsKeyId: string): Promise<string> => {
    try {
      const { decrypt } = AWSCrypto.buildClient(
        AWSCrypto.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
      );

      const keyring = new AWSCrypto.KmsKeyringNode({ generatorKeyId: kmsKeyId });
      const bufferedValue = fromBase64(encryptedSalt);
      const { plaintext, messageHeader } = await decrypt(keyring, bufferedValue);

      // TODO: messageHeader has details about how the value was encrypted
      // we may want to include a check similar to AwsCryptoFactory
      // to validate this information.

      if (!plaintext) {
        throw new Error("KMS decryption returned empty plaintext");
      }

      const decoder = new TextDecoder();
      const decodedValue = decoder.decode(plaintext);
      return decodedValue;
    } catch (error) {
      throw new Error(
        `Failed to decrypt salt with KMS: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  return { hashValue };
};
