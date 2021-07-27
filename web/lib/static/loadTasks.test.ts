import fs from "fs";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug } from "./loadTasks";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllTaskUrlSlugs", () => {
    it("returns a list of task url slugs from within task files", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";
      const taskMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      mockedFs.readFileSync.mockReturnValueOnce(taskMd1).mockReturnValueOnce(taskMd2);

      mockReadDirReturn(["task1.md", "task2.md"]);
      const allTaskUrlSlugs = loadAllTaskUrlSlugs();
      expect(allTaskUrlSlugs).toHaveLength(2);
      expect(allTaskUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { urlSlug: "some-url-slug-1" } },
          { params: { urlSlug: "some-url-slug-2" } },
        ])
      );
    });
  });

  describe("loadTaskByUrlSlug", () => {
    it("returns task entity from url slug", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some Task Name1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: "www.example1.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const taskMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'name: "Some Task Name2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      mockReadDirReturn(["task1.md", "task2.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd1)
        .mockReturnValueOnce(taskMd2)
        .mockReturnValueOnce(taskMd2);

      expect(loadTaskByUrlSlug("some-url-slug-2")).toEqual({
        id: "some-id-2",
        name: "Some Task Name2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "www.example2.com",
        callToActionText: "",
        contentMd: "\n# I am a header2\n\nI am a text content2",
      });
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
