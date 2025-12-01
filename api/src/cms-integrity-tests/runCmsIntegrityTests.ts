import { checkAnytimeActionCategoryUsage } from "@businessnjgovnavigator/api/src/cms-integrity-tests/anytimeActionCategoryUsage";
import { checkTaskUsage } from "@businessnjgovnavigator/api/src/cms-integrity-tests/taskIntegrityTests";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";

export const runCmsIntegrityTests = async (stage: string, logger: LogWriterType): Promise<void> => {
  const topicArn = await getConfigValue("cms_alerts_sns_topic_arn");

  const topicArnIsSetForThisEnvironment = topicArn !== "";

  if (topicArnIsSetForThisEnvironment) {
    await checkAnytimeActionCategoryUsage(topicArn, stage, logger);
    await checkTaskUsage(topicArn, stage, logger);
  }
};
