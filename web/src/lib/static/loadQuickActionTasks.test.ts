import {
  loadAllQuickActionTasks,
  loadAllQuickActionTaskUrlSlugs,
  loadQuickActionTaskByUrlSlug,
} from "@/lib/static/loadQuickActionTasks";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadQuickActionTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllQuickActionTasks", () => {
    it("returns a list of quick actions task objects", async () => {
      const quickActionTask1 =
        "---\n" +
        "filename: some filename\n" +
        "name: quick action task name1\n" +
        "icon: test.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const quickActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: quick action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(quickActionTask1).mockReturnValueOnce(quickActionTask2);

      const quickActionTasks = await loadAllQuickActionTasks();
      expect(quickActionTasks).toHaveLength(2);
      expect(quickActionTasks).toEqual(
        expect.arrayContaining([
          {
            name: "quick action task name1",
            icon: "test.svg",
            filename: "some filename",
            urlSlug: "urlslug1",
            contentMd: "Some content description 1",
            callToActionLink: "CallToActionLink1",
            callToActionText: "CallToActionText1",
            form: "Form1",
          },
          {
            name: "quick action task name2",
            icon: "test2.svg",
            filename: "some filename 2",
            urlSlug: "urlslug2",
            contentMd: "Some content description 2",
            callToActionLink: "CallToActionLink2",
            callToActionText: "CallToActionText2",
            form: "Form2",
          },
        ])
      );
    });
  });

  describe("loadQuickActionTaskByUrlSlug", () => {
    it("returns quick actions task by matching given url slug", () => {
      const quickActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: quick action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const quickActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: quick action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(quickActionTask1) // read first file in list
        .mockReturnValueOnce(quickActionTask2) // read second file in list
        .mockReturnValueOnce(quickActionTask2); // read file once we found the match

      const quickActionTask = loadQuickActionTaskByUrlSlug("urlslug2");
      expect(quickActionTask).toEqual({
        name: "quick action task name2",
        icon: "test2.svg",
        filename: "some filename 2",
        urlSlug: "urlslug2",
        contentMd: "Some content description 2",
        callToActionLink: "CallToActionLink2",
        callToActionText: "CallToActionText2",
        form: "Form2",
      });
    });
  });

  describe("loadAllQuickActionTaskUrlSlugs", () => {
    it("returns quick actions task by matching given url slug", () => {
      const quickActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: quick action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const quickActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: quick action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const quickActionTask3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: quick action task name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readFileSync
        .mockReturnValueOnce(quickActionTask1)
        .mockReturnValueOnce(quickActionTask2)
        .mockReturnValueOnce(quickActionTask3);

      mockReadDirReturn({ value: ["qa1.md", "qa2.md", "qa3.md"], mockedFs });

      const quickActionsByUrlSlug = loadAllQuickActionTaskUrlSlugs();
      expect(quickActionsByUrlSlug).toHaveLength(3);
      expect(quickActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { quickActionTaskUrlSlug: "urlslug1" } },
          { params: { quickActionTaskUrlSlug: "urlslug2" } },
          { params: { quickActionTaskUrlSlug: "urlslug3" } },
        ])
      );
    });
  });
});
