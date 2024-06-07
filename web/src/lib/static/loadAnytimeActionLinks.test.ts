import { loadAllAnytimeActionLinks } from "@/lib/static/loadAnytimeActionLinks";
import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadAnytimeActionLinks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllAnytimeActionLinks", () => {
    it("returns a list of anytime actions links objects", async () => {
      const anytimeActionLinks1 =
        "---\n" +
        "filename: some filename\n" +
        "name: anytime action link name1\n" +
        "icon: test.svg\n" +
        "externalRoute: externalRoute1\n" +
        "---\n" +
        "Some content description 1";

      const anytimeActionLinks2 =
        "---\n" +
        "filename: some filename 2\n" +
        "name: anytime action link name2\n" +
        "icon: test2.svg\n" +
        "externalRoute: externalRoute2\n" +
        "---\n" +
        "Some content description 2";

      mockReadDirReturn({ value: ["opp1.md", "opp2.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(anytimeActionLinks1).mockReturnValueOnce(anytimeActionLinks2);

      const anytimeActionLinks = await loadAllAnytimeActionLinks();
      expect(anytimeActionLinks).toHaveLength(2);
      expect(anytimeActionLinks).toEqual(
        expect.arrayContaining([
          {
            name: "anytime action link name1",
            icon: "test.svg",
            filename: "some filename",
            externalRoute: "externalRoute1",
          },
          {
            name: "anytime action link name2",
            icon: "test2.svg",
            filename: "some filename 2",
            externalRoute: "externalRoute2",
          },
        ])
      );
    });
  });
});
