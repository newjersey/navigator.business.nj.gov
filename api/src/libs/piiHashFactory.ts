import { createSecurePIIHash } from "business-crypto-exploration/src/secure-pii-hash";
/**
 * Hashes a PII using a salt from the environment and SHA3-256.
 * @param {string} pii - The PII to hash.
 * @returns {Promise<string>} - The resulting hash as a hex string.
 */
export async function hashPII(pii: string): Promise<string> {
  if (!pii) throw new Error("PII is required");
  const salt = process.env.PII_HASH_SALT;
  const hash = await createSecurePIIHash(pii, {
    applicationSalt: salt,
    iterations: 100000,
    // Optional: For enhanced security with AWS KMS
    // isEncryptedSalt: true,
    // kmsKeyId: 'alias/your-kms-key'
  });

  return hash;
}
