import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";
import { loadAllLicenseUrlSlugs, loadLicenseByUrlSlug } from "./loadLicenses";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadLicenses", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllLicensesUrlSlugs", () => {
    it("returns a dynamic list of LicenseEvent url slugs from LicenseEvent license files based on licenseEventType", () => {
      const taskMd1 =
        "---\n" +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      const taskMd2 =
        "---\n" +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      mockedFs.readFileSync.mockReturnValueOnce(taskMd1).mockReturnValueOnce(taskMd2);

      mockReadDirReturn({ value: ["task1.md", "task2.md"], mockedFs });
      const allLicenseUrlSlugs = loadAllLicenseUrlSlugs();

      expect(allLicenseUrlSlugs).toHaveLength(4);
      expect(allLicenseUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { licenseUrlSlug: "some-url-slug-1-expiration" } },
          { params: { licenseUrlSlug: "some-url-slug-1-renewal" } },
          { params: { licenseUrlSlug: "some-url-slug-2-expiration" } },
          { params: { licenseUrlSlug: "some-url-slug-2-renewal" } },
        ])
      );
    });
  });

  describe("loadLicenseByUrlSlug", () => {
    it("returns task entity from url slug", () => {
      const taskMd1 =
        "---\n" +
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
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      mockReadDirReturn({ value: ["task1.md", "task2.md", "task3.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd1) // read first file in list
        .mockReturnValueOnce(taskMd2) // read second file in list
        .mockReturnValueOnce(taskMd2); // read file once we found the match

      expect(loadLicenseByUrlSlug("some-url-slug-2-expiration")).toEqual({
        filename: "task2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "www.example2.com",
        callToActionText: "",
        contentMd: "\n# I am a header2\n\nI am a text content2",
      });
    });
  });
});
