import { loadAllFundings, loadAllFundingUrlSlugs, loadFundingByUrlSlug } from "@/lib/static/loadFundings";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadFundings", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllFundings", () => {
    it("returns a list of all fundings", () => {
      const fundingMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Funding Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "fundingType: loan\n" +
        "agency:\n" +
        "  - NJEDA\n" +
        "publishStageArchive: null\n" +
        'openDate: ""\n' +
        'dueDate: ""\n' +
        "status: open\n" +
        "programFrequency: ongoing\n" +
        "businessStage: operating\n" +
        "employeesRequired: n/a\n" +
        "homeBased: yes\n" +
        "mwvb: n/a\n" +
        "preferenceForOpportunityZone: null\n" +
        "county:\n" +
        "  - All\n" +
        "sector:\n" +
        "  - cannabis\n" +
        "---\n" +
        "Some content description 1";

      const fundingMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Funding Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync.mockReturnValueOnce(fundingMd1).mockReturnValueOnce(fundingMd2);
      const allFundings = loadAllFundings();

      expect(allFundings).toHaveLength(2);
      expect(allFundings).toEqual(
        expect.arrayContaining([
          {
            id: "some-id-1",
            filename: "opp1",
            name: "Some Funding Name 1",
            urlSlug: "some-url-slug-1",
            callToActionLink: "https://www.example.com/1",
            callToActionText: "Click here 1",
            contentMd: "Some content description 1",
            fundingType: "loan",
            agency: ["NJEDA"],
            publishStageArchive: null,
            openDate: "",
            dueDate: "",
            status: "open",
            programFrequency: "ongoing",
            businessStage: "operating",
            employeesRequired: "n/a",
            homeBased: "yes",
            mwvb: "n/a",
            preferenceForOpportunityZone: null,
            county: ["All"],
            sector: ["cannabis"],
          },
          {
            id: "some-id-2",
            filename: "opp2",
            name: "Some Funding Name 2",
            urlSlug: "some-url-slug-2",
            callToActionLink: "https://www.example.com/2",
            callToActionText: "Click here 2",
            contentMd: "Some content description 2",
          },
        ])
      );
    });
  });

  describe("loadAllFundingUrlSlugs", () => {
    it("returns a list of all funding url slugs", () => {
      const fundingMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Funding Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "---\n" +
        "Some content description 1";

      const fundingMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Funding Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync.mockReturnValueOnce(fundingMd1).mockReturnValueOnce(fundingMd2);
      const allUrlSlugs = loadAllFundingUrlSlugs();

      expect(allUrlSlugs).toHaveLength(2);
      expect(allUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { fundingUrlSlug: "some-url-slug-1" } },
          { params: { fundingUrlSlug: "some-url-slug-2" } },
        ])
      );
    });
  });

  describe("loadFundingByUrlSlug", () => {
    it("returns fundings matching given url slug", () => {
      const fundingMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Funding Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "---\n" +
        "Some content description 1";

      const fundingMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Funding Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn(["opp1.md", "opp2.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(fundingMd1) // read first file in list
        .mockReturnValueOnce(fundingMd2) // read second file in list
        .mockReturnValueOnce(fundingMd2); // read file once we found the match

      const funding = loadFundingByUrlSlug("some-url-slug-2");

      expect(funding).toEqual({
        id: "some-id-2",
        filename: "opp2",
        name: "Some Funding Name 2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "https://www.example.com/2",
        callToActionText: "Click here 2",
        contentMd: "Some content description 2",
      });
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
