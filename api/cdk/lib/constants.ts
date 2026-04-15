// lib/constants.ts
export const CONTENT_STAGE = "content";
export const TESTING_STAGE = "testing";
export const STAGING_STAGE = "staging";
export const PROD_STAGE = "prod";
export const DEV_STAGE = "dev";
export const LOCAL_STAGE = "local";
export const LOWER_STAGES = [LOCAL_STAGE, DEV_STAGE, TESTING_STAGE, CONTENT_STAGE];
export const DOCUMENT_S3_BUCKET_NAME = `nj-bfs-user-documents`;
export const BUSINESSES_TABLE = "businesses-table";
export const USERS_TABLE = "users-table";
export const MESSAGES_TABLE = "messages-table";
export const AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY = process.env.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY || "";
export const NAVIGATOR_WEBSERVICE = "NavigatorWebService";
export const NAVIGATOR_DB_CLIENT = "NavigatorDBClient";
export const HEALTH_CHECK_SERVICE = "HealthCheckService";
export const ECS_SERVICE_NAME = "bfs-navigator";
export const ECS_CLUSTER_NAME = "bfs_container_cluster";
export const HEALTH_CHECK_ENDPOINTS: Record<string, string> = {
  self: "self",
  elevator: "dynamics/elevator",
  fireSafety: "dynamics/fire-safety",
  housing: "dynamics/housing",
  rgbDynamicsLicenseStatus: "rgbDynamics/license-status",
  webserviceLicenseStatus: "webservice/license-status",
  webserviceFormation: "webservice/formation",
  taxClearance: "tax-clearance",
  xrayRegistration: "xray-registration",
  taxFilingClient: "tax-filing-client",
};
