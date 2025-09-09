import { runCmsIntegrityTests } from "@businessnjgovnavigator/api/src/cms-integrity-tests/runCmsIntegrityTests";
import { STAGE } from "@functions/config";
import { runHealthChecks } from "@libs/healthCheck";
import { LogWriter } from "@libs/logWriter";

export const handler = async (): Promise<void> => {
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  await (STAGE !== "content" && STAGE !== "testing"
    ? runHealthChecks(logger)
    : runCmsIntegrityTests(STAGE, logger));
};
