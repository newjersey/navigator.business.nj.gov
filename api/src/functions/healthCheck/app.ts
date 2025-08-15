import { STAGE } from "@functions/config";
import { runHealthChecks } from "@libs/healthCheck";
import { LogWriter } from "@libs/logWriter";

// this is lambda that is deployed in AWS
export default async function handler(): Promise<void> {
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  await runHealthChecks(logger);
}
