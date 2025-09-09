import { runCmsIntegrityTests } from "@businessnjgovnavigator/api/src/cms-integrity-tests/runCmsIntegrityTests";
import { STAGE } from "@functions/config";
import { runHealthChecks } from "@libs/healthCheck";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";

export const handler = async (): Promise<void> => {
  const isLocal = STAGE === "local";

  const logger = isLocal ? ConsoleLogWriter : LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  await (["content", "testing"].includes(STAGE)
    ? runCmsIntegrityTests(STAGE, logger)
    : runHealthChecks(logger));
};
