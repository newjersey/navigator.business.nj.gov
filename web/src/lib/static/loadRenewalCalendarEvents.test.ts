import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";
import {
  loadAllRenewalCalendarEventUrlSlugs,
  loadRenewalCalendarEventByUrlSlug,
} from "./loadRenewalCalendarEvents";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadRenewalCalendarEvents", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllRenewalsCalendarEventUrlSlugs", () => {
    it("returns a dynamic list of RenewalCalendarEvent url slugs from RenewalCalendarEvent renewal files based on renewalEventType", () => {
      const renewalMd1 =
        "---\n" +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      const renewalMd2 =
        "---\n" +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      mockedFs.readFileSync.mockReturnValueOnce(renewalMd1).mockReturnValueOnce(renewalMd2);

      mockReadDirReturn({ value: ["task1.md", "task2.md"], mockedFs });
      const allRenewalUrlSlugs = loadAllRenewalCalendarEventUrlSlugs();

      expect(allRenewalUrlSlugs).toHaveLength(2);
      expect(allRenewalUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { renewalCalendarEventUrlSlug: "some-url-slug-1" } },
          { params: { renewalCalendarEventUrlSlug: "some-url-slug-2" } },
        ]),
      );
    });
  });

  describe("loadRenewalCalendarEventByUrlSlug", () => {
    it("returns renewal entity from url slug", () => {
      const renewalMd1 =
        "---\n" +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: "www.example1.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const renewalMd2 =
        "---\n" +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      mockReadDirReturn({ value: ["renewalMd1.md", "renewalMd2.md", "renewalMd3.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(renewalMd1) // read first file in list
        .mockReturnValueOnce(renewalMd2) // read second file in list
        .mockReturnValueOnce(renewalMd2); // read file once we found the match

      expect(loadRenewalCalendarEventByUrlSlug("some-url-slug-2")).toEqual({
        filename: "renewalMd2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "www.example2.com",
        callToActionText: "",
        contentMd: "\n# I am a header2\n\nI am a text content2",
      });
    });
  });
});
