import { mockReadDirReturnOnce } from "@/lib/static/mockHelpers";
import fs from "fs";
import { loadAllTaskUrlSlugs, loadTaskByFileName, loadTaskByUrlSlug } from "./loadTasks";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadTaskByFileName", () => {
    it("loadTaskByFileName with both licenseTask and task dependencies", () => {
      const taskMd =
        "---\n" +
        'id: "some-id"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug"\n' +
        'callToActionLink: "www.example.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const licenseMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some License Name1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: "www.example1.com"\n' +
        'callToActionText: ""\n' +
        "requiresLocation: true\n" +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const licenseMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'name: "Some License Name2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "requiresLocation: true\n" +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      const dependencyFile = JSON.stringify({
        dependencies: [
          { licenseTask: "license1", licenseTaskDependencies: ["license2"], taskDependencies: ["taskMd"] },
        ],
      });

      mockReadDirReturnOnce({ value: ["task1.md"], mockedFs });
      mockReadDirReturnOnce({ value: ["license1.md", "license2.md"], mockedFs });
      mockReadDirReturnOnce({ value: [], mockedFs });

      mockedFs.readFileSync
        .mockReturnValueOnce(licenseMd1)
        .mockReturnValueOnce(dependencyFile)
        .mockReturnValueOnce(taskMd)
        .mockReturnValueOnce(licenseMd2);

      expect(loadTaskByFileName("license1", "directory")).toEqual({
        id: "some-id-1",
        name: "Some License Name1",
        filename: "license1",
        urlSlug: "some-url-slug-1",
        callToActionLink: "www.example1.com",
        callToActionText: "",
        requiresLocation: true,
        contentMd: "\n# I am a header1\n\nI am a text content1",
        unlockedBy: [
          { name: "Some Task Name", urlSlug: "some-url-slug", filename: "taskMd", id: "some-id" },
          { name: "Some License Name2", urlSlug: "some-url-slug-2", filename: "license2", id: "some-id-2" },
        ],
      });
    });
  });

  describe("loadAllTaskUrlSlugs", () => {
    it("returns a list of task url slugs from within task files", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";
      const taskMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";
      const licenseMd1 =
        "---\n" +
        'id: "some-id-3"\n' +
        'name: "Some License Task Name"\n' +
        'urlSlug: "some-url-slug-3"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";
      const stepMd1 =
        "---\n" +
        'id: "some-id-4"\n' +
        'name: "Some Step Name"\n' +
        'urlSlug: "some-url-slug-4"\n' +
        'callToActionLink: ""\n' +
        'callToActionText: ""\n' +
        "---\n";

      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd1)
        .mockReturnValueOnce(taskMd2)
        .mockReturnValueOnce(licenseMd1)
        .mockReturnValueOnce(stepMd1);

      mockReadDirReturnOnce({ value: ["task1.md", "task2.md"], mockedFs });
      mockReadDirReturnOnce({ value: ["license1.md"], mockedFs });
      mockReadDirReturnOnce({ value: ["step1.md"], mockedFs });
      mockReadDirReturnOnce({ value: [], mockedFs });
      mockReadDirReturnOnce({ value: [], mockedFs });

      const allTaskUrlSlugs = loadAllTaskUrlSlugs();
      expect(allTaskUrlSlugs).toHaveLength(4);
      expect(allTaskUrlSlugs).toEqual(
        expect.arrayContaining([
          { params: { taskUrlSlug: "some-url-slug-1" } },
          { params: { taskUrlSlug: "some-url-slug-2" } },
          { params: { taskUrlSlug: "some-url-slug-3" } },
          { params: { taskUrlSlug: "some-url-slug-4" } },
        ])
      );
    });
  });

  describe("loadTaskByUrlSlug", () => {
    it("returns task entity from url slug", () => {
      const taskMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some Task Name1"\n' +
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
        'id: "some-id-2"\n' +
        'name: "Some Task Name2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "requiresLocation: true\n" +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      const taskMd3 =
        "---\n" +
        'id: "some-id-3"\n' +
        'name: "Some Task Name3"\n' +
        'urlSlug: "some-url-slug-3"\n' +
        'callToActionLink: "www.example3.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header3\n" +
        "\n" +
        "I am a text content3";

      const dependencyFile = JSON.stringify({
        dependencies: [
          { task: "task2", taskDependencies: ["task3"] },
          { task: "task1", taskDependencies: ["task2"] },
        ],
      });

      mockReadDirReturnOnce({ value: ["task1.md", "task2.md", "task3.md"], mockedFs });

      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd1) // read first file in list
        .mockReturnValueOnce(taskMd2) // read second file in list
        .mockReturnValueOnce(taskMd2) // read file once we found the match
        .mockReturnValueOnce(dependencyFile) // read dependency file
        .mockReturnValueOnce(taskMd3); // read unlocked-by task file

      expect(loadTaskByUrlSlug("some-url-slug-2")).toEqual({
        id: "some-id-2",
        name: "Some Task Name2",
        filename: "task2",
        urlSlug: "some-url-slug-2",
        callToActionLink: "www.example2.com",
        callToActionText: "",
        requiresLocation: true,
        contentMd: "\n# I am a header2\n\nI am a text content2",
        unlockedBy: [
          { name: "Some Task Name3", urlSlug: "some-url-slug-3", filename: "task3", id: "some-id-3" },
        ],
      });
    });

    it("returns a license entity from url slug", () => {
      const taskMd =
        "---\n" +
        'id: "some-id"\n' +
        'name: "Some Task Name"\n' +
        'urlSlug: "some-url-slug"\n' +
        'callToActionLink: "www.example.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const licenseMd1 =
        "---\n" +
        'id: "some-id-1"\n' +
        'name: "Some License Name1"\n' +
        'urlSlug: "some-url-slug-1"\n' +
        'callToActionLink: "www.example1.com"\n' +
        'callToActionText: ""\n' +
        "requiresLocation: true\n" +
        "---\n" +
        "\n" +
        "# I am a header1\n" +
        "\n" +
        "I am a text content1";

      const licenseMd2 =
        "---\n" +
        'id: "some-id-2"\n' +
        'name: "Some License Name2"\n' +
        'urlSlug: "some-url-slug-2"\n' +
        'callToActionLink: "www.example2.com"\n' +
        'callToActionText: ""\n' +
        "requiresLocation: true\n" +
        "---\n" +
        "\n" +
        "# I am a header2\n" +
        "\n" +
        "I am a text content2";

      const dependencyFile = JSON.stringify({
        dependencies: [{ licenseTask: "license1", licenseTaskDependencies: ["license2"] }],
      });

      mockReadDirReturnOnce({ value: ["task1.md"], mockedFs });
      mockReadDirReturnOnce({ value: ["license1.md", "license2.md"], mockedFs });

      mockedFs.readFileSync
        .mockReturnValueOnce(taskMd) // read first file in list
        .mockReturnValueOnce(licenseMd1) // read second file in list
        .mockReturnValueOnce(licenseMd1) // read file once we found the match
        .mockReturnValueOnce(dependencyFile) // read dependency file
        .mockReturnValueOnce(licenseMd2); /// read unlocked-by task file

      expect(loadTaskByUrlSlug("some-url-slug-1")).toEqual({
        id: "some-id-1",
        name: "Some License Name1",
        filename: "license1",
        urlSlug: "some-url-slug-1",
        callToActionLink: "www.example1.com",
        callToActionText: "",
        requiresLocation: true,
        contentMd: "\n# I am a header1\n\nI am a text content1",
        unlockedBy: [
          { name: "Some License Name2", urlSlug: "some-url-slug-2", filename: "license2", id: "some-id-2" },
        ],
      });
    });
  });
});
