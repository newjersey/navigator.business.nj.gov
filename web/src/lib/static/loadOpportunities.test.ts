import {
  loadAllOpportunities,
  loadAllOpportunityUrlSlugs,
  loadOpportunityByUrlSlug,
} from "@/lib/static/loadOpportunities";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadOpportunities", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllOpportunities", () => {
    it("returns a list of all opportunities", () => {
      const oppMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Opportunity Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        'type: "FUNDING" \n' +
        "---\n" +
        "Some content description 1";

      const oppMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Opportunity Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        'type: "CERTIFICATION" \n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync.mockReturnValueOnce(oppMd1).mockReturnValueOnce(oppMd2);
      const allOpportunities = loadAllOpportunities();

      expect(allOpportunities).toHaveLength(2);
      expect(allOpportunities).toEqual(
        expect.arrayContaining([
          {
            id: "some-id-1",
            filename: "opp1",
            name: "Some Opportunity Name 1",
            urlSlug: "some-url-slug-1",
            callToActionLink: "https://www.example.com/1",
            callToActionText: "Click here 1",
            contentMd: "Some content description 1",
            type: "FUNDING",
          },
          {
            id: "some-id-2",
            filename: "opp2",
            name: "Some Opportunity Name 2",
            urlSlug: "some-url-slug-2",
            callToActionLink: "https://www.example.com/2",
            callToActionText: "Click here 2",
            contentMd: "Some content description 2",
            type: "CERTIFICATION",
          },
        ])
      );
    });
  });

  describe("loadAllOpportunityUrlSlugs", () => {
    it("returns a list of all opportunity url slugs", () => {
      const oppMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Opportunity Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        'type: "FUNDING" \n' +
        "---\n" +
        "Some content description 1";

      const oppMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Opportunity Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        'type: "CERTIFICATION" \n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync.mockReturnValueOnce(oppMd1).mockReturnValueOnce(oppMd2);
      const allUrlSlugs = loadAllOpportunityUrlSlugs();

      expect(allUrlSlugs).toHaveLength(2);
      expect(allUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { opportunityUrlSlug: "some-url-slug-1" } },
          { params: { opportunityUrlSlug: "some-url-slug-2" } },
        ])
      );
    });
  });

  describe("loadOpportunityByUrlSlug", () => {
    it("returns opportunity matching given url slug", () => {
      const oppMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Opportunity Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        'type: "FUNDING" \n' +
        "---\n" +
        "Some content description 1";

      const oppMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Opportunity Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        'type: "CERTIFICATION" \n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(oppMd1) // read first file in list
        .mockReturnValueOnce(oppMd2) // read second file in list
        .mockReturnValueOnce(oppMd2); // read file once we found the match

      const opportunity = loadOpportunityByUrlSlug("some-url-slug-2");

      expect(opportunity).toEqual({
        id: "some-id-2",
        filename: "opp2",
        name: "Some Opportunity Name 2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "https://www.example.com/2",
        callToActionText: "Click here 2",
        contentMd: "Some content description 2",
        type: "CERTIFICATION",
      });
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
