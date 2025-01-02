import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadAllFundingUrlSlugs, loadFundingByUrlSlug } from "@/lib/static/loadFundings";
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

  describe("loadAllCertifications", () => {
    it("returns a list of all certifications", () => {
      const certMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Cert Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "agency:\n" +
        "  - NJEDA\n" +
        'sidebarCardBodyText: "*some cool* description"\n' +
        "---\n" +
        "Some content description 1";

      const certMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Cert Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["cert1.md", "cert2.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(certMd1).mockReturnValueOnce(certMd2);
      const all = loadAllCertifications();

      expect(all).toHaveLength(2);
      expect(all).toEqual(
        expect.arrayContaining([
          {
            id: "some-id-1",
            filename: "cert1",
            name: "Some Cert Name 1",
            urlSlug: "some-url-slug-1",
            callToActionLink: "https://www.example.com/1",
            callToActionText: "Click here 1",
            contentMd: "Some content description 1",
            sidebarCardBodyText: "*some cool* description",
            agency: ["NJEDA"],
          },
          {
            id: "some-id-2",
            filename: "cert2",
            name: "Some Cert Name 2",
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

  describe("loadAllCertificationUrlSlugs", () => {
    it("returns a list of all certification url slugs", () => {
      const certMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Cert Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "---\n" +
        "Some content description 1";

      const certMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Cert Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["cert1.md", "cert2.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(certMd1).mockReturnValueOnce(certMd2);
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

  describe("loadCertificationByUrlSlug", () => {
    it("returns certification matching given url slug", () => {
      const certMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'name: "Some Cert Name 1"\n' +
        'callToActionLink: "https://www.example.com/1"\n' +
        'callToActionText: "Click here 1"\n' +
        "---\n" +
        "Some content description 1";

      const certMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'name: "Some Cert Name 2"\n' +
        'callToActionLink: "https://www.example.com/2"\n' +
        'callToActionText: "Click here 2"\n' +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(certMd1) // read first file in list
        .mockReturnValueOnce(certMd2) // read second file in list
        .mockReturnValueOnce(certMd2); // read file once we found the match

      const found = loadFundingByUrlSlug("some-url-slug-2");

      expect(found).toEqual({
        id: "some-id-2",
        filename: "opp2",
        name: "Some Cert Name 2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "https://www.example.com/2",
        callToActionText: "Click here 2",
        contentMd: "Some content description 2",
        sidebarCardBodyText: "",
      });
    });
  });
});
