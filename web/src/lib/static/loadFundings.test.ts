import { loadAllFundings, loadAllFundingUrlSlugs, loadFundingByUrlSlug } from "@/lib/static/loadFundings";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

vi.mock("fs");
vi.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadFundings", () => {
  let mockedFs: vi.Mocked<typeof fs>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedFs = fs as vi.Mocked<typeof fs>;
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
        "status: rolling application\n" +
        "programFrequency: ongoing\n" +
        "businessStage: operating\n" +
        "employeesRequired: n/a\n" +
        "homeBased: yes\n" +
        "certifications: []\n" +
        "preferenceForOpportunityZone: null\n" +
        "county:\n" +
        "  - All\n" +
        "sector:\n" +
        "  - cannabis\n" +
        "sidebarCardBodyText: some *cool* description\n" +
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

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
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
            status: "rolling application",
            programFrequency: "ongoing",
            businessStage: "operating",
            employeesRequired: "n/a",
            homeBased: "yes",
            certifications: [],
            preferenceForOpportunityZone: null,
            county: ["All"],
            sector: ["cannabis"],
            sidebarCardBodyText: "some *cool* description",
          },
          {
            id: "some-id-2",
            filename: "opp2",
            name: "Some Funding Name 2",
            urlSlug: "some-url-slug-2",
            callToActionLink: "https://www.example.com/2",
            callToActionText: "Click here 2",
            contentMd: "Some content description 2",
            sidebarCardBodyText: "",
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

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
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

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
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
        sidebarCardBodyText: "",
      });
    });
  });
});
