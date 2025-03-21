import { STAGE } from "@functions/config";
import { runHealthChecks } from "@libs/healthCheck";
import { LogWriter } from "@libs/logWriter";

export default async function handler(): Promise<void> {
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  await runHealthChecks(logger);
}
