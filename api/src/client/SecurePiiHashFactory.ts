import { KMS } from "@aws-sdk/client-kms";
import { PiiHashClient } from "@domain/types";
import * as crypto from "node:crypto";

type Context = {
  stage: string;
  purpose: string;
  origin: string;
};

const cryptoUtils: { pbkdf2: typeof crypto.pbkdf2 } = {
  pbkdf2: (
    password: crypto.BinaryLike,
    salt: crypto.BinaryLike,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: Buffer) => void,
  ) => {
    return crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
  },
};

export const AWSPiiHashFactory = (generatorKeyId: string, context: Context): PiiHashClient => {
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

  interface PIIHashOptions {
    applicationSalt?: string;
    iterations?: number;
    kmsKeyId?: string;
    isEncryptedSalt?: boolean;
  }

  const hashValue = (sensitiveString: string, options: PIIHashOptions = {}): Promise<string> => {
    if (!sensitiveString || typeof sensitiveString !== "string") {
      throw new Error("Sensitive data must be a non-empty string");
    }
    const normalizedString = sensitiveString.replaceAll(/[^\dA-Za-z]/g, "");

    let applicationSalt = options.applicationSalt || process.env.PII_HASH_SALT;

    if (!applicationSalt) {
      throw new Error(
        "Application salt must be provided in options or as PII_HASH_SALT environment variable",
      );
    }

    // If the salt is encrypted, decrypt it with KMS
    if (options.isEncryptedSalt || process.env.PII_HASH_SALT_ENCRYPTED === "true") {
      const kmsKeyId = options.kmsKeyId || process.env.PII_HASH_KMS_KEY_ID;

      if (!kmsKeyId) {
        throw new Error("KMS Key ID is required when using an encrypted salt");
      }

      applicationSalt = await decryptSaltWithKms(applicationSalt, kmsKeyId);
    }

    // Default iteration count
    const iterations =
      options.iterations ||
      (process.env.PII_HASH_ITERATIONS
        ? Number.parseInt(process.env.PII_HASH_ITERATIONS, 10)
        : 100000);

    try {
      // Use PBKDF2 with the application salt and SHA3-512
      const hash = await new Promise<string>((resolve, reject) => {
        cryptoUtils.pbkdf2(
          normalizedString,
          applicationSalt,
          iterations,
          64,
          "sha3-512",
          (err, key) => {
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
      const kms = new KMS();

      const decryptResult = await kms.decrypt({
        CiphertextBlob: Buffer.from(encryptedSalt, "base64"),
        KeyId: kmsKeyId,
      });

      if (!decryptResult.Plaintext) {
        throw new Error("KMS decryption returned empty plaintext");
      }

      return decryptResult.Plaintext.toString();
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
