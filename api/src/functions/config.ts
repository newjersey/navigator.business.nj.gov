export const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false;
export const IS_DOCKER = process.env.IS_DOCKER === "true" || false;
export const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
export const BUSINESSES_TABLE = process.env.BUSINESSES_TABLE || "businesses-table-local";
export const DYNAMO_OFFLINE_PORT = Number.parseInt(process.env.DYNAMO_PORT || "8000");
export const STAGE = process.env.STAGE || "local";
export const AWS_CRYPTO_KEY = process.env.AWS_CRYPTO_KEY || "";
export const AWS_CRYPTO_CONTEXT_STAGE = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
export const AWS_CRYPTO_CONTEXT_PURPOSE = process.env.AWS_CRYPTO_CONTEXT_PURPOSE || "";
export const AWS_CRYPTO_CONTEXT_ORIGIN = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";
