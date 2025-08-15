import fs from "fs";
import {
  loadAllAnytimeActionTasks,
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "./loadAnytimeActionTasks";
import { mockReadDirectoryReturn } from "./mockHelpers";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllAnytimeActionTasks", () => {
    it("returns a list of anytime actions task objects", async () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename\n" +
        "name: anytime action task name1\n" +
        "icon: test.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "category:\n" +
        "  - test-cat\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "category:\n" +
        "  - test-cat\n" +
        "---\n" +
        "Some content description 2";

      const fakeCategoryMapping =
        "---\n" + "category-name: Test Cat\n" + "id: test-cat\n" + "---\n";

      mockedFs.readdirSync
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["opp1.md", "opp2.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1)
        .mockReturnValueOnce(fakeCategoryMapping)
        .mockReturnValueOnce(anytimeActionTask2)
        .mockReturnValueOnce(fakeCategoryMapping);

      const anytimeActionTasks = await loadAllAnytimeActionTasks();
      expect(anytimeActionTasks).toHaveLength(2);
      expect(anytimeActionTasks).toEqual(
        expect.arrayContaining([
          {
            name: "anytime action task name1",
            icon: "test.svg",
            filename: "some filename",
            urlSlug: "urlslug1",
            contentMd: "Some content description 1",
            callToActionLink: "CallToActionLink1",
            callToActionText: "CallToActionText1",
            form: "Form1",
            type: "task",
            category: [
              {
                categoryId: "test-cat",
                categoryName: "Test Cat",
              },
            ],
          },
          {
            name: "anytime action task name2",
            icon: "test2.svg",
            filename: "some filename 2",
            urlSlug: "urlslug2",
            contentMd: "Some content description 2",
            callToActionLink: "CallToActionLink2",
            callToActionText: "CallToActionText2",
            form: "Form2",
            type: "task",
            category: [
              {
                categoryId: "test-cat",
                categoryName: "Test Cat",
              },
            ],
          },
        ]),
      );
    });
  });

  describe("loadAnytimeActionTaskByUrlSlug", () => {
    it("returns anytime actions task by matching given url slug", () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "category:\n" +
        "  - test-cat\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "category:\n" +
        "  - test-cat\n" +
        "---\n" +
        "Some content description 2";

      const fakeCategoryMapping =
        "---\n" + "category-name: Test Cat\n" + "id: test-cat\n" + "---\n";

      mockedFs.readdirSync
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["opp1.md", "opp2.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1) // read first file in list
        .mockReturnValueOnce(anytimeActionTask2) // read second file in list
        .mockReturnValueOnce(anytimeActionTask2) // read file once we found the match
        .mockReturnValueOnce(fakeCategoryMapping);

      const anytimeActionTask = loadAnytimeActionTaskByUrlSlug("urlslug2");
      expect(anytimeActionTask).toEqual({
        name: "anytime action task name2",
        icon: "test2.svg",
        filename: "some filename 2",
        urlSlug: "urlslug2",
        contentMd: "Some content description 2",
        callToActionLink: "CallToActionLink2",
        callToActionText: "CallToActionText2",
        form: "Form2",
        type: "task",
        category: [
          {
            categoryId: "test-cat",
            categoryName: "Test Cat",
          },
        ],
      });
    });
  });

  describe("loadAllAnytimeActionTaskUrlSlugs", () => {
    it("returns anytime actions task by matching given url slug", () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const anytimeActionTask3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: anytime action task name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1)
        .mockReturnValueOnce(anytimeActionTask2)
        .mockReturnValueOnce(anytimeActionTask3);

      mockReadDirectoryReturn({ value: ["qa1.md", "qa2.md", "qa3.md"], mockedFs });

      const anytimeActionsByUrlSlug = loadAllAnytimeActionTaskUrlSlugs();
      expect(anytimeActionsByUrlSlug).toHaveLength(3);
      expect(anytimeActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { anytimeActionTaskUrlSlug: "urlslug1" } },
          { params: { anytimeActionTaskUrlSlug: "urlslug2" } },
          { params: { anytimeActionTaskUrlSlug: "urlslug3" } },
        ]),
      );
    });
  });
});
