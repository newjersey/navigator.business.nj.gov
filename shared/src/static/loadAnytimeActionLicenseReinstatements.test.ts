import fs from "fs";
import {
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionLicenseReinstatementsUrlSlugs,
  loadAnytimeActionLicenseReinstatementsByUrlSlug,
} from "./loadAnytimeActionLicenseReinstatements";
import { mockReadDirectoryReturn } from "./mockHelpers";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionLicenseReinstatements", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
    // Mock existsSync to return true for the expected path structure
    mockedFs.existsSync = jest.fn().mockReturnValue(true);
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

      const fakeCategoryMapping =
        "---\n" +
        "category-name: Reactivate My Expired Permit, License or Registration\n" +
        "id: reactivate-my-expired-permit-license-or-registration\n" +
        "---\n";

      mockedFs.readdirSync
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["opp1.md", "opp2.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseReinstatement1)
        .mockReturnValueOnce(fakeCategoryMapping)
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2)
        .mockReturnValueOnce(fakeCategoryMapping);

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
            category: [
              {
                categoryId: "reactivate-my-expired-permit-license-or-registration",
                categoryName: "Reactivate My Expired Permit, License or Registration",
              },
            ],
            form: "Form1",
            type: "license-reinstatement",
          },
          {
            name: "anytime action license reinstatement name2",
            icon: "test2.svg",
            filename: "some filename 2",
            urlSlug: "urlslug2",
            contentMd: "Some content description 2",
            callToActionLink: "CallToActionLink2",
            callToActionText: "CallToActionText2",
            category: [
              {
                categoryId: "reactivate-my-expired-permit-license-or-registration",
                categoryName: "Reactivate My Expired Permit, License or Registration",
              },
            ],
            form: "Form2",
            type: "license-reinstatement",
          },
        ]),
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

      const fakeCategoryMapping =
        "---\n" +
        "category-name: Reactivate My Expired Permit, License or Registration\n" +
        "id: reactivate-my-expired-permit-license-or-registration\n" +
        "---\n";

      mockedFs.readdirSync
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["opp1.md", "opp2.md"])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce(["fake-category.md"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionLicenseReinstatement1) // read first file in list
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2) // read second file in list
        .mockReturnValueOnce(anytimeActionLicenseReinstatement2) // read file once we found the match
        .mockReturnValueOnce(fakeCategoryMapping);

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
        category: [
          {
            categoryId: "reactivate-my-expired-permit-license-or-registration",
            categoryName: "Reactivate My Expired Permit, License or Registration",
          },
        ],
        type: "license-reinstatement",
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

      mockReadDirectoryReturn({ value: ["qa1.md", "qa2.md", "qa3.md"], mockedFs });

      const anytimeActionsByUrlSlug = loadAllAnytimeActionLicenseReinstatementsUrlSlugs();
      expect(anytimeActionsByUrlSlug).toHaveLength(3);
      expect(anytimeActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug1" } },
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug2" } },
          { params: { anytimeActionLicenseReinstatementUrlSlug: "urlslug3" } },
        ]),
      );
    });
  });
});
