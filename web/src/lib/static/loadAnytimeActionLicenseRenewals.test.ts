import {
  loadAllAnytimeActionLicenseRenewals,
  loadAllAnytimeActionLicenseRenewalsUrlSlugs,
  loadAnytimeActionLicenseRenewalsByUrlSlug,
} from "@/lib/static/loadAnytimeActionLicenseRenewals";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionLicenseRenewals", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllAnytimeActionLicenseRenewals", () => {
    it("returns a list of anytime actions license renewals objects", async () => {
      const anytimeActionLicenseRenewal1 =
        "---\n" +
        "filename: some filename\n" +
        "name: anytime action license renewal name1\n" +
        "icon: test.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionLicenseRenewal2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license renewal name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseRenewal1)
        .mockReturnValueOnce(anytimeActionLicenseRenewal2);

      const anytimeActionTasks = await loadAllAnytimeActionLicenseRenewals();
      expect(anytimeActionTasks).toHaveLength(2);
      expect(anytimeActionTasks).toEqual(
        expect.arrayContaining([
          {
            name: "anytime action license renewal name1",
            icon: "test.svg",
            filename: "some filename",
            urlSlug: "urlslug1",
            contentMd: "Some content description 1",
            callToActionLink: "CallToActionLink1",
            callToActionText: "CallToActionText1",
            form: "Form1",
          },
          {
            name: "anytime action license renewal name2",
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

  describe("loadAnytimeActionLicenseRenewalsByUrlSlug", () => {
    it("returns anytime actions license renewal by matching given url slug", () => {
      const anytimeActionLicenseRenewal1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action license renewal name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionLicenseRenewal2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license renewal name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseRenewal1) // read first file in list
        .mockReturnValueOnce(anytimeActionLicenseRenewal2) // read second file in list
        .mockReturnValueOnce(anytimeActionLicenseRenewal2); // read file once we found the match

      const anytimeActionTask = loadAnytimeActionLicenseRenewalsByUrlSlug("urlslug2");
      expect(anytimeActionTask).toEqual({
        name: "anytime action license renewal name2",
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

  describe("loadAllAnytimeActionLicenseRenewalsUrlSlugs", () => {
    it("returns anytime actions license reinstatement by matching given anytimeAction LicenseRenewal Url slug", () => {
      const anytimeActionRenewal1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action license renewal name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionRenewal2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license renewal name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const anytimeActionLicenseRenewal3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: anytime action license renewal name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionRenewal1)
        .mockReturnValueOnce(anytimeActionRenewal2)
        .mockReturnValueOnce(anytimeActionLicenseRenewal3);

      mockReadDirReturn({ value: ["qa1.md", "qa2.md", "qa3.md"], mockedFs });

      const anytimeActionsByUrlSlug = loadAllAnytimeActionLicenseRenewalsUrlSlugs();
      expect(anytimeActionsByUrlSlug).toHaveLength(3);
      expect(anytimeActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { anytimeActionLicenseRenewalUrlSlug: "urlslug1" } },
          { params: { anytimeActionLicenseRenewalUrlSlug: "urlslug2" } },
          { params: { anytimeActionLicenseRenewalUrlSlug: "urlslug3" } },
        ])
      );
    });
  });
});
