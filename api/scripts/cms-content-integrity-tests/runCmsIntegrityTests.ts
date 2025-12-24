import { checkAnytimeActionCategoryUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/anytimeActionCategoryUsage";
import { checkContextualInfoLinksUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/contextualInfoLinks";
import { checkTaskUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/taskIntegrityTests";
import { getConfigValue } from "@libs/ssmUtils";

export const runCmsIntegrityTests = async (): Promise<void> => {
  let anyErrors = false;

  const topicArn = await getConfigValue("cms_alerts_sns_topic_arn", undefined, "content");

  const anytimeActionCategoryHasErrors = await checkAnytimeActionCategoryUsage(topicArn);
  anyErrors = anytimeActionCategoryHasErrors || anyErrors;
  const taskHasErrors = await checkTaskUsage(topicArn);
  anyErrors = taskHasErrors || anyErrors;
  const contextualInfoHasErrors = await checkContextualInfoLinksUsage(topicArn);
  anyErrors = contextualInfoHasErrors || anyErrors;

  if (anyErrors) {
    console.error("Failed with Errors");
    throw new Error("Failed with Errors, see console errors above");
  }
  console.log("Succeeded No Errors");
};

runCmsIntegrityTests();
