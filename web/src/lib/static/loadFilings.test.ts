import fs from "fs";
import { loadAllFilingUrlSlugs, loadFilingByUrlSlug } from "./loadFilings";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadFilings", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllFilingUrlSlugs", () => {
    it("returns a list of filing url slugs from within filing files", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'filingId: "some-filingId-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Task Name"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      const taskMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'filingId: "some-filingId-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Task Name"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      mockedFs.readFileSync.mockReturnValueOnce(taskMd1).mockReturnValueOnce(taskMd2);

      mockReadDirReturn(["task1.md", "task2.md"]);
      const allFilingUrlSlugs = loadAllFilingUrlSlugs();

      expect(allFilingUrlSlugs).toHaveLength(2);
      expect(allFilingUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { filingUrlSlug: "some-url-slug-1" } },
          { params: { filingUrlSlug: "some-url-slug-2" } },
        ])
      );
    });
  });

  describe("loadFilingByUrlSlug", () => {
    it("returns task entity from url slug", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'filingId: "some-filingId-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Task Name1"\n' +
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
        'filingId: "some-filingId-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Task Name2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      mockReadDirReturn(["task1.md", "task2.md", "task3.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd1) // read first file in list
        .mockReturnValueOnce(taskMd2) // read second file in list
        .mockReturnValueOnce(taskMd2); // read file once we found the match

      expect(loadFilingByUrlSlug("some-url-slug-2")).toEqual({
        id: "some-id-2",
        filingId: "some-filingId-2",
        name: "Some Task Name2",
        filename: "task2",
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
