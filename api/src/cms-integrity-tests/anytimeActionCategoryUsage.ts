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
        const logMessage = `The *"${AnytimeAction.name}"* Anytime Action has a category that no longer exists *"${AnytimeAction.category[0].categoryId}"*, please replace this with a new category`;
        await publishSnsMessage(logMessage, topicArn, stage);
      }
    }
  } catch (error) {
    logger.LogError(`Error When Running CMS integrity Tests: ${error}`);
  }
};
