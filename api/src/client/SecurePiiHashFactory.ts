/**
 * Secure-pii-hash.ts
 *
 * This module provides a secure method for generating deterministic, one-way hashes of sensitive
 * identifiers (like Social Security Numbers, Tax IDs, etc.) for uniqueness checking in database
 * systems.
 *
 * The implementation uses PBKDF2 with SHA3-512 for quantum-resistant hashing. The resulting hash is
 * deterministic (same input always produces same hash) and suitable for use as a DynamoDB GSI key.
 *
 * Security features:
 *
 * - High-iteration PBKDF2 for brute force resistance
 * - SHA3-512 for quantum resistance
 * - Application salt for rainbow table protection
 * - Optional KMS salt decryption for enhanced security
 * - Deterministic output suitable for database indexing
 *
 * @module secure-pii-hash
 */

import * as crypto from "crypto";
import { KMS } from "@aws-sdk/client-kms";

export const cryptoUtils: { pbkdf2: typeof crypto.pbkdf2 } = {
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

/** Configuration options for sensitive data hashing */
export interface PIIHashOptions {
  /**
   * Application salt for hashing This should be a high-entropy secret value unique to your
   * application
   */
  applicationSalt?: string;

  /** Number of PBKDF2 iterations (higher = more secure but slower) Default: 100000 */
  iterations?: number;

  /**
   * Optional AWS KMS Key ID to decrypt the application salt If provided along with
   * isEncryptedSalt=true, the salt will be decrypted using this KMS key
   */
  kmsKeyId?: string;

  /**
   * When true, the applicationSalt is assumed to be KMS-encrypted and base64-encoded and will be
   * decrypted before use
   */
  isEncryptedSalt?: boolean;
}

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
export async function createSecurePIIHash(
  sensitiveString: string,
  options: PIIHashOptions = {},
): Promise<string> {
  // Input validation
  if (!sensitiveString || typeof sensitiveString !== "string") {
    throw new Error("Sensitive data must be a non-empty string");
  }

  // Normalize input by removing any non-alphanumeric characters
  // This ensures format consistency (e.g., "123-45-6789" and "123456789" produce the same hash)
  const normalizedString = sensitiveString.replace(/[^0-9a-zA-Z]/g, "");

  // Get the application salt
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
    (process.env.PII_HASH_ITERATIONS ? parseInt(process.env.PII_HASH_ITERATIONS, 10) : 100000);

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
}

/**
 * Decrypts an encrypted salt value using AWS KMS
 *
 * @param encryptedSalt - Base64-encoded encrypted salt
 * @param kmsKeyId - KMS Key ID to use for decryption
 * @returns Promise resolving to the decrypted salt
 * @throws Error if KMS decryption fails
 */
async function decryptSaltWithKms(encryptedSalt: string, kmsKeyId: string): Promise<string> {
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
      `Failed to decrypt salt with KMS: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Simpler variant that uses environment variables for configuration. This is a convenience wrapper
 * around createSecurePIIHash.
 *
 * Required environment variables:
 *
 * - PII_HASH_SALT: Application salt for hashing
 *
 * Optional environment variables:
 *
 * - PII_HASH_ITERATIONS: Number of PBKDF2 iterations (default: 100000)
 * - PII_HASH_KMS_KEY_ID: AWS KMS Key ID (required if using encrypted salt)
 * - PII_HASH_SALT_ENCRYPTED: "true" if the salt is encrypted
 *
 * @param sensitiveString - The sensitive data string to hash
 * @returns Promise resolving to a hex string hash
 * @throws Error if required environment variables are missing or if hashing fails
 */
export async function hashPII(sensitiveString: string): Promise<string> {
  return createSecurePIIHash(sensitiveString);
}

// Legacy function names for backward compatibility
export const createSecureSSNHash = createSecurePIIHash;
export const hashSSN = hashPII;
