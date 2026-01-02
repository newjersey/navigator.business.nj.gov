import {
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@businessnjgovnavigator/shared/src/static";
import { publishSnsMessage } from "@libs/awsSns";

export const checkAnytimeActionCategoryUsage = async (topicArn: string): Promise<boolean> => {
  let hasErrors = false;

  const urlSlugs = loadAllAnytimeActionTaskUrlSlugs();

  console.log("\n Starting Check Anytime Action Category Usage");

  let num = 0;

  for (const slug of urlSlugs) {
    const AnytimeAction = loadAnytimeActionTaskByUrlSlug(slug.params.anytimeActionTaskUrlSlug);
    if (AnytimeAction.category[0].categoryId === AnytimeAction.category[0].categoryName) {
      const logMessage = `business-ux-content: The *"${AnytimeAction.name}"* Anytime Action has a category that no longer exists (*"${AnytimeAction.category[0].categoryId}"*). Please replace this with a new category.`;
      console.error(logMessage);
      hasErrors = true;
      num++;
      await publishSnsMessage(logMessage, topicArn);
    }
  }
  console.log(`Anytime Action Category's has ${num} errors`);
  return hasErrors;
};
