/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  loadAllAnytimeActionTasks,
  loadAllAnytimeActionTaskUrlSlugs,
  loadAnytimeActionTaskByUrlSlug,
} from "@/lib/static/loadAnytimeActionTasks";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  const adminFolder = ["opp1.md"];
  const licensesFolder = ["opp2.md"];
  const reinstatementsFolder = ["opp3.md"];

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllAnytimeActionTasks", () => {
    it("returns a list of anytime actions task objects", async () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename\n" +
        "name: anytime action task name1\n" +
        "icon: test.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const anytimeActionTask3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: anytime action task name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readdirSync
        // @ts-ignore
        .mockReturnValueOnce(adminFolder)
        // @ts-ignore
        .mockReturnValueOnce(licensesFolder)
        // @ts-ignore
        .mockReturnValueOnce(reinstatementsFolder);

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1)
        .mockReturnValueOnce(anytimeActionTask2)
        .mockReturnValueOnce(anytimeActionTask3);

      const anytimeActionTasks = loadAllAnytimeActionTasks();
      expect(anytimeActionTasks).toHaveLength(3);
      expect(anytimeActionTasks).toEqual(
        expect.arrayContaining([
          {
            name: "anytime action task name1",
            icon: "test.svg",
            filename: "some filename",
            urlSlug: "urlslug1",
            contentMd: "Some content description 1",
            callToActionLink: "CallToActionLink1",
            callToActionText: "CallToActionText1",
            form: "Form1",
          },
          {
            name: "anytime action task name2",
            icon: "test2.svg",
            filename: "some filename 2",
            urlSlug: "urlslug2",
            contentMd: "Some content description 2",
            callToActionLink: "CallToActionLink2",
            callToActionText: "CallToActionText2",
            form: "Form2",
          },
          {
            name: "anytime action task name3",
            icon: "test3.svg",
            filename: "some filename 3",
            urlSlug: "urlslug3",
            contentMd: "Some content description 3",
            callToActionLink: "CallToActionLink3",
            callToActionText: "CallToActionText3",
            form: "Form3",
          },
        ])
      );
    });
  });

  describe("loadAnytimeActionTaskByUrlSlug", () => {
    it("returns anytime actions task by matching given url slug", () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      mockedFs.readdirSync
        // @ts-ignore
        .mockReturnValueOnce(adminFolder)
        // @ts-ignore
        .mockReturnValueOnce(licensesFolder)
        // @ts-ignore
        .mockReturnValueOnce(reinstatementsFolder);

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1) // read for admin
        .mockReturnValueOnce(anytimeActionTask2) // read for licenses
        .mockReturnValueOnce(anytimeActionTask2) // read for reinstatements
        .mockReturnValueOnce(anytimeActionTask2); // read file once we found the match

      const anytimeActionTask = loadAnytimeActionTaskByUrlSlug("urlslug2");
      expect(anytimeActionTask).toEqual({
        name: "anytime action task name2",
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

  describe("loadAllAnytimeActionTaskUrlSlugs", () => {
    it("returns anytime actions task by matching given url slug", () => {
      const anytimeActionTask1 =
        "---\n" +
        "filename: some filename 1\n" +
        "name: anytime action task name1\n" +
        "icon: test1.svg\n" +
        "urlSlug: urlslug1\n" +
        "callToActionLink: CallToActionLink1\n" +
        "callToActionText: CallToActionText1\n" +
        "form: Form1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionTask2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action task name2\n" +
        "icon: test2.svg\n" +
        "urlSlug: urlslug2\n" +
        "callToActionLink: CallToActionLink2\n" +
        "callToActionText: CallToActionText2\n" +
        "form: Form2\n" +
        "---\n" +
        "Some content description 2";

      const anytimeActionTask3 =
        "---\n" +
        "filename: some filename 3\n" +
        "name: anytime action task name3\n" +
        "icon: test3.svg\n" +
        "urlSlug: urlslug3\n" +
        "callToActionLink: CallToActionLink3\n" +
        "callToActionText: CallToActionText3\n" +
        "form: Form3\n" +
        "---\n" +
        "Some content description 3";

      mockedFs.readFileSync
        .mockReturnValueOnce(anytimeActionTask1)
        .mockReturnValueOnce(anytimeActionTask2)
        .mockReturnValueOnce(anytimeActionTask3);

      mockReadDirReturn({ value: ["qa1.md"], mockedFs });
      mockReadDirReturn({ value: ["qa2.md"], mockedFs });
      mockReadDirReturn({ value: ["qa3.md"], mockedFs });

      const anytimeActionsByUrlSlug = loadAllAnytimeActionTaskUrlSlugs();
      expect(anytimeActionsByUrlSlug).toHaveLength(3);
      expect(anytimeActionsByUrlSlug).toEqual(
        expect.arrayContaining([
          { params: { anytimeActionTaskUrlSlug: "urlslug1" } },
          { params: { anytimeActionTaskUrlSlug: "urlslug2" } },
          { params: { anytimeActionTaskUrlSlug: "urlslug3" } },
        ])
      );
    });
  });
});
