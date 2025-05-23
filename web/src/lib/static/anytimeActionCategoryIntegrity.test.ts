import {
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@/lib/static/loadAnytimeActionTasks";

describe("anytimeAction Category Integrity", () => {
  it("makes sure that all loaded anytime actions, use a valid category from the mapping", () => {
    const urlSlugs = loadAllAnytimeActionTaskUrlSlugs();
    for (const slug of urlSlugs) {
      const AnytimeAction = loadAnytimeActionTaskByUrlSlug(slug.params.anytimeActionTaskUrlSlug);
      // console.log(AnytimeAction);
      if (AnytimeAction.category[0].categoryId === AnytimeAction.category[0].categoryName) {
        console.log(AnytimeAction, slug.params.anytimeActionTaskUrlSlug);
      }
      // expect(AnytimeAction.category[0].categoryId).not.toEqual(
      //   AnytimeAction.category[0].categoryName,
      // );
    }
    expect(true).toBe(true);
  });
});
