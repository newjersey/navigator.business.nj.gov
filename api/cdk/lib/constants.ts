// lib/constants.ts
export const CONTENT_STAGE = "content";
export const TESTING_STAGE = "testing";
export const PROD_STAGE = "prod";
export const DEV_STAGE = "dev";
export const DOCUMENT_S3_BUCKET_NAME = `nj-bfs-user-documents`;
export const BUSINESSES_TABLE = "businesses-table";
export const USERS_TABLE = "users-table";
export const MESSAGES_TABLE = "messages-table";
export const AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY = process.env.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY || "";
