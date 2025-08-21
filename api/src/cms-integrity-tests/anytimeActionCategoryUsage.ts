import { LogWriterType } from "@libs/logWriter";
import { loadAllAnytimeActionTaskUrlSlugs, loadAnytimeActionTaskByUrlSlug } from "@shared/static";

export const checkAnytimeActionCategoryUsage = (logWriter: LogWriterType): void => {
  const urlSlugs = loadAllAnytimeActionTaskUrlSlugs(false);
  for (const slug of urlSlugs) {
    const AnytimeAction = loadAnytimeActionTaskByUrlSlug(
      slug.params.anytimeActionTaskUrlSlug,
      false,
    );
    if (AnytimeAction.category[0].categoryId === AnytimeAction.category[0].categoryName) {
      console.log("this one didn't work", AnytimeAction.category[0]);
      logWriter.LogError(
        `${AnytimeAction.name} has a category that no longer exists (${AnytimeAction.category[0].categoryId}), please replace this with a new category`,
      );
    }
  }
  console.log("ANYTIMEACTION USAGE RAN");
};
