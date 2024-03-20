import { runHealthChecks } from "@libs/healthCheck";
import { LogWriter } from "@libs/logWriter";

export default async function handler(): Promise<void> {
  const STAGE = process.env.STAGE || "local";
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  await runHealthChecks(logger);
}
