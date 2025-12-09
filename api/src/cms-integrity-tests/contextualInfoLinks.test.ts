import { findMatchingContextualInfo } from "@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinks";
import { mockReadDirectoryReturn } from "@shared/static";
// eslint-disable-next-line unicorn/prefer-node-protocol
import fs from "fs";
jest.mock("fs");

describe("ContextualInfoLinks", () => {
  describe("findMatchingContextualInfo", () => {
    let mockedFs: jest.Mocked<typeof fs>;

    beforeEach(() => {
      jest.resetAllMocks();
      mockedFs = fs as jest.Mocked<typeof fs>;
    });

    it("finds a match in label text", () => {
      const contextualInfoFile = "---\n" + 'filename: "contextual-info-file"\n' + "---\n";

      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockReadDirectoryReturn({ value: ["contextual-info-file"], mockedFs });
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);
      mockedFs.readFileSync.mockReturnValueOnce(contextualInfoFile);

      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [
            { content: "something `something|contextual-info-file`", label: "Label" },
          ],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("returns no results without any matches in label text", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds a match in block text", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("returns no results without any matches in block text", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds a match in list text", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("returns no results without any matches in list text", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds matches across all 3 when all 3 have matches", () => {
      const fileDataArray = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds matches across mutiple array elements when passed", () => {
      const fileDataArray = [
        {
          fileName: "filename1",
          labelledTexts: [{ content: "`content1|ein`", label: "label1" }],
          blockTexts: [],
          listTexts: [],
        },
        {
          fileName: "filename2",
          labelledTexts: [{ content: "`content2|ein`", label: "label1" }],
          blockTexts: ["something something `block2|ein` something something"],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([{}, {}]);
    });
  });
});
