import { checkAnytimeActionCategoryUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/anytimeActionCategoryUsage";
import { checkContextualInfoLinksUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/contextualInfoLinks";
import { checkSlugCollisions } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/slugCollisions";
import { checkTaskUsage } from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/taskIntegrityTests";
import { getConfigValue } from "@libs/ssmUtils";

const runCmsIntegrityTests = async (): Promise<void> => {
  const topicArn = await getConfigValue("cms_alerts_sns_topic_arn", undefined, "content");

  const anytimeActionCategoryHasErrors = await checkAnytimeActionCategoryUsage(topicArn);
  const taskHasErrors = await checkTaskUsage(topicArn);
  const contextualInfoHasErrors = await checkContextualInfoLinksUsage(topicArn);
  const slugCollisionHasErrors = await checkSlugCollisions(topicArn);

  if (
    [
      anytimeActionCategoryHasErrors,
      taskHasErrors,
      contextualInfoHasErrors,
      slugCollisionHasErrors,
    ].some(Boolean)
  ) {
    console.error("Failed with Errors");
    throw new Error("Failed with Errors, see console errors above");
  }
  console.log("Succeeded No Errors");
};

runCmsIntegrityTests();
