import {
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@businessnjgovnavigator/shared/static";

describe("anytimeAction Category Integrity", () => {
  it("makes sure that all loaded anytime actions, use a valid category from the mapping", () => {
    const urlSlugs = loadAllAnytimeActionTaskUrlSlugs(true);
    for (const slug of urlSlugs) {
      const AnytimeAction = loadAnytimeActionTaskByUrlSlug(
        slug.params.anytimeActionTaskUrlSlug,
        true,
      );
      expect(AnytimeAction.category[0].categoryId).not.toEqual(
        AnytimeAction.category[0].categoryName,
      );
    }
    expect(true).toBe(true);
  });
});
