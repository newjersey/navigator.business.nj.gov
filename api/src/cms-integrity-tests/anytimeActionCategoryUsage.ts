import { publishSnsMessage } from "@libs/awsSns";
import { LogWriterType } from "@libs/logWriter";
import { loadAllAnytimeActionTaskUrlSlugs, loadAnytimeActionTaskByUrlSlug } from "@shared/static";

export const checkAnytimeActionCategoryUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  try {
    const urlSlugs = loadAllAnytimeActionTaskUrlSlugs(true);

    for (const slug of urlSlugs) {
      const AnytimeAction = loadAnytimeActionTaskByUrlSlug(
        slug.params.anytimeActionTaskUrlSlug,
        true,
      );
      if (AnytimeAction.category[0].categoryId === AnytimeAction.category[0].categoryName) {
        const logMessage = `business-ux-content: The *"${AnytimeAction.name}"* Anytime Action has a category that no longer exists (*"${AnytimeAction.category[0].categoryId}"*). Please replace this with a new category.`;
        await publishSnsMessage(logMessage, topicArn, stage);
      }
    }
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};
