export const IS_OFFLINE = process.env.IS_OFFLINE?.toLowerCase() === "true" || false;
export const IS_DOCKER = process.env.IS_DOCKER === "true" || false;
export const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
export const BUSINESSES_TABLE = process.env.BUSINESSES_TABLE || "businesses-table-local";
export const DYNAMO_OFFLINE_PORT = Number.parseInt(process.env.DYNAMO_PORT || "8000");
export const STAGE = process.env.STAGE || "local";

export const AWS_CRYPTO_CONTEXT_ORIGIN = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";
export const AWS_CRYPTO_CONTEXT_STAGE = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
export const AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY = process.env.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY || "";
export const AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE =
  process.env.AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE || "";
export const AWS_CRYPTO_TAX_ID_HASHING_KEY = process.env.AWS_CRYPTO_TAX_ID_HASHING_KEY || "";
export const AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT =
  process.env.AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT || "";
export const AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE =
  process.env.AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE || "";
