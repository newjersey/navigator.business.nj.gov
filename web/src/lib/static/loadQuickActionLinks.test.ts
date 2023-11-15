import { loadAllQuickActionLinks } from "@/lib/static/loadQuickActionLinks";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadQuickActionLinks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllQuickActionLinks", () => {
    it("returns a list of quick actions links objects", async () => {
      const quickActionLinks1 =
        "---\n" +
        "filename: some filename\n" +
        "name: quick action link name1\n" +
        "icon: test.svg\n" +
        "externalRoute: externalRoute1\n" +
        "---\n" +
        "Some content description 1";

      const quickActionLinks2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: quick action link name2\n" +
        "icon: test2.svg\n" +
        "externalRoute: externalRoute2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(quickActionLinks1).mockReturnValueOnce(quickActionLinks2);

      const quickActionLinks = await loadAllQuickActionLinks();
      expect(quickActionLinks).toHaveLength(2);
      expect(quickActionLinks).toEqual(
        expect.arrayContaining([
          {
            name: "quick action link name1",
            icon: "test.svg",
            filename: "some filename",
            externalRoute: "externalRoute1",
          },
          {
            name: "quick action link name2",
            icon: "test2.svg",
            filename: "some filename 2",
            externalRoute: "externalRoute2",
          },
        ])
      );
    });
  });
});
