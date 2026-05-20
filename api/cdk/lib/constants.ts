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
/** Shared ECS cluster name for every static-site service in an AWS account. */
export const STATIC_SITE_CLUSTER_NAME = "bfs-static-site";
/** STAGE tag value for static-site resources shared by every stage in an AWS account. */
export const STATIC_SITE_SHARED_RESOURCE_TAG = "shared";
/** Base name used for static-site AWS resources that are duplicated per stage. */
export const STATIC_SITE_SERVICE_BASE_NAME = "bfs-static-site";
/** ECS container name used in the static-site task definition and ALB target mapping. */
export const STATIC_SITE_CONTAINER_NAME = "static-site";
/** Port exposed by the static-site Next.js standalone server inside the Fargate task. */
export const STATIC_SITE_CONTAINER_PORT = 3000;
/** Health-check route served by the static site for ALB and container health checks. */
export const STATIC_SITE_HEALTH_CHECK_PATH = "/healthz";
/** Public hostnames that external DNS and WAF configuration map to each internal ALB origin. */
export const STATIC_SITE_HOSTNAMES: Record<string, string> = {
  [DEV_STAGE]: "dev.next.business.nj.gov",
  [TESTING_STAGE]: "testing.next.business.nj.gov",
  [CONTENT_STAGE]: "content.next.business.nj.gov",
  [STAGING_STAGE]: "staging.next.business.nj.gov",
  [PROD_STAGE]: "next.business.nj.gov",
};
/** Shared ACM certificate ID covering every static-site hostname. */
export const STATIC_SITE_CERTIFICATE_ID = "97592b7b-b08f-41f0-9667-68a0e8927687";
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
