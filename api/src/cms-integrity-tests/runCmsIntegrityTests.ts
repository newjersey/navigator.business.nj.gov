import { checkAnytimeActionCategoryUsage } from "@businessnjgovnavigator/api/src/cms-integrity-tests/anytimeActionCategoryUsage";
import { getConfigValue } from "@libs/ssmUtils";

export const runCmsIntegrityTests = async (stage: string): Promise<void> => {
  if (stage === "testing" || stage === "content") {
    const topicArn = await getConfigValue("cms_alerts_sns_topic_arn");

    const topicArnIsSetForThisEnvironment = topicArn !== "";

    if (topicArnIsSetForThisEnvironment) {
      checkAnytimeActionCategoryUsage(topicArn, stage);
    }
  }
};
