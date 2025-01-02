import {
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionLicenseReinstatementsUrlSlugs,
  loadAnytimeActionLicenseReinstatementsByUrlSlug,
} from "@/lib/static/loadAnytimeActionLicenseReinstatements";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

vi.mock("fs");

vi.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionLicenseReinstatements", () => {
  let mockedFs: vi.Mocked<typeof fs>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedFs = fs as vi.Mocked<typeof fs>;
  });

  describe("loadAllAnytimeActionLicenseReinstatements", () => {
    it("returns a list of anytime actions license reinstatement objects", async () => {
      const anytimeActionLicenseReinstatement1 =
        "---\n" +
        "filename: some filename\n" +
        "name: anytime action license reinstatement name1\n" +
        "icon: test.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionLicenseReinstatement2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license reinstatement name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseReinstatement1)
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2);

      const anytimeActionTasks = await loadAllAnytimeActionLicenseReinstatements();
      expect(anytimeActionTasks).toHaveLength(2);
      expect(anytimeActionTasks).toEqual(
        expect.arrayContaining([
          {
            name: "anytime action license reinstatement name1",
            icon: "test.svg",
            filename: "some filename",
            urlSlug: "urlslug1",
            contentMd: "Some content description 1",
            callToActionLink: "CallToActionLink1",
            callToActionText: "CallToActionText1",
            form: "Form1",
          },
          {
            name: "anytime action license reinstatement name2",
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

  describe("loadAnytimeActionLicenseReinstatementsByUrlSlug", () => {
    it("returns anytime actions license reinstatement by matching given url slug", () => {
      const anytimeActionLicenseReinstatement1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action license reinstatement name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionLicenseReinstatement2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license reinstatement name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseReinstatement1) // read first file in list
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2) // read second file in list
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2); // read file once we found the match

      const anytimeActionTask = loadAnytimeActionLicenseReinstatementsByUrlSlug("urlslug2");
      expect(anytimeActionTask).toEqual({
        name: "anytime action license reinstatement name2",
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

  describe("loadAllAnytimeActionLicenseReinstatementsUrlSlugs", () => {
    it("returns anytime actions license reinstatement by matching given anytimeAction LicenseReinstatement Url slug", () => {
      const anytimeActionReinstatement1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action license reinstatement name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionReinstatement2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action license reinstatement name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const anytimeActionLicenseReinstatement3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: anytime action license reinstatement name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionReinstatement1)
        .mockReturnValueOnce(anytimeActionReinstatement2)
        .mockReturnValueOnce(anytimeActionLicenseReinstatement3);

      mockReadDirReturn({ value: ["qa1.md", "qa2.md", "qa3.md"], mockedFs });

      const anytimeActionsByUrlSlug = loadAllAnytimeActionLicenseReinstatementsUrlSlugs();
      expect(anytimeActionsByUrlSlug).toHaveLength(3);
      expect(anytimeActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug1" } },
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug2" } },
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug3" } },
        ])
      );
    });
  });
});
