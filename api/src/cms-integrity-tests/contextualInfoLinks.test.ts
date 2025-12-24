import { findMatchingContextualInfo } from "@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinks";
import * as sharedContextualInfoUtils from "@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinksUtil";
import { FileData } from "@shared/lib/search";
import { loadYamlFiles } from "@shared/static";

jest.mock("@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinksUtil", () => ({
  ...jest.requireActual(
    "@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinksUtil",
  ),
  allContextualInfoFileNames: jest.fn(),
}));

const allContextualInfoFileNames =
  sharedContextualInfoUtils.allContextualInfoFileNames as jest.MockedFunction<() => Set<string>>;

const EXISTS_CONTEXTUAL_INFO_FILE = "EXISTS_CONTEXTUAL_INFO_FILE";
const DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE = "DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE";

const composeErrorMessage = (numberOfExpectedCollections: number): string => {
  return `We expected ${numberOfExpectedCollections} number of collections in our CMS. You have likely added a new collection to the CMS and now must add to the Contextual Info Search tool to make sure any contextual info links that may ever be used in that new collection can be caught. Look at contextualInfoLinks.ts and the files in shared/lib/search for more details`;
};

const expectedNumberofCollections = 12;

describe("ContextualInfoLinks", () => {
  describe("findMatchingContextualInfo", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("finds a non-existant contextual info label in label text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [
            {
              content: `something \`something|${DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE}\``,
              label: "Label",
            },
          ],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([
        { filename: "filename", snippets: [DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE] },
      ]);
    });

    it("returns no matches because contextaul info exists in known files from label text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [
            {
              content: `something \`something|${EXISTS_CONTEXTUAL_INFO_FILE}\``,
              label: "Label",
            },
          ],
          blockTexts: [],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds a non-existant contextual info block text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [
            `something something \`label|${DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE}\``,
            "something else",
          ],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([
        { filename: "filename", snippets: [DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE] },
      ]);
    });

    it("returns no matches because contextaul info exists in known files from block text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [
            `something something \`label|${EXISTS_CONTEXTUAL_INFO_FILE}\``,
            "something else",
          ],
          listTexts: [],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds a non-existant contextual info in list text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [
            {
              content: [
                `something something \`label|${DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE}\``,
                "something something else",
              ],
              label: "label",
            },
          ],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([
        { filename: "filename", snippets: [DOES_NOT_EXISTS_CONTEXTUAL_INFO_FILE] },
      ]);
    });

    it("returns no matches because contextaul info exists in known files from list text", () => {
      const knownContextualInfoFiles: Set<string> = new Set([EXISTS_CONTEXTUAL_INFO_FILE]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [],
          listTexts: [
            {
              content: [
                `something something \`label|${EXISTS_CONTEXTUAL_INFO_FILE}\``,
                "something something else",
              ],
              label: "label",
            },
          ],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([]);
    });

    it("finds matches across all 3 when all 3 have matches", () => {
      const content1 = "content1";
      const content2 = "content2";
      const content3 = "content3";

      const knownContextualInfoFiles: Set<string> = new Set([]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [{ content: `something \`something|${content1}\``, label: "Label" }],
          blockTexts: [`something something \`label|${content2}\``, "something else"],
          listTexts: [
            {
              content: [`something something \`label|${content3}\``, "something something else"],
              label: "label",
            },
          ],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([{ filename: "filename", snippets: [content2, content1, content3] }]);
    });

    it("finds multiple matches within the same string", () => {
      const content1 = "content1";
      const content2 = "content2";
      const content3 = "content3";

      const knownContextualInfoFiles: Set<string> = new Set([]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [
            {
              content: `something \`something|${content1}\` \`something|${content1}\``,
              label: "Label",
            },
          ],
          blockTexts: [
            `something something \`label|${content2}\` \`label|${content2}\``,
            "something else",
          ],
          listTexts: [
            {
              content: [
                `something something \`label|${content3}\` \`label|${content3}\``,
                "something something else",
              ],
              label: "label",
            },
          ],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([
        {
          filename: "filename",
          snippets: [content2, content2, content1, content1, content3, content3],
        },
      ]);
    });

    it("finds matches across mutiple files when passed", () => {
      const content1 = "content1";
      const content2 = "content2";
      const content3 = "content3";
      const content21 = "content21";
      const content22 = "content22";
      const content23 = "content23";

      const knownContextualInfoFiles: Set<string> = new Set([]);

      allContextualInfoFileNames.mockReturnValue(knownContextualInfoFiles);

      const fileDataArray: FileData[] = [
        {
          fileName: "filename",
          labelledTexts: [],
          blockTexts: [
            `something something \`label|${content2}\``,
            "something else",
            `something something \`label|${content22}\``,
            "something else",
          ],
          listTexts: [],
        },
        {
          fileName: "filename2",
          labelledTexts: [
            { content: `something \`something|${content21}\``, label: "Label" },
            { content: `something \`something|${content1}\``, label: "Label" },
          ],
          blockTexts: [],
          listTexts: [
            {
              content: [`something something \`label|${content3}\``, "something something else"],
              label: "label",
            },
            {
              content: [`something something \`label|${content23}\``, "something something else"],
              label: "label",
            },
          ],
        },
      ];

      const macthes = findMatchingContextualInfo(fileDataArray);
      expect(macthes).toEqual([
        { filename: "filename", snippets: [content2, content22] },
        { filename: "filename2", snippets: [content21, content1, content3, content23] },
      ]);
    });
  });

  describe("This is a test to make sure this is updated as the CMS is updated so it stays accurate", () => {
    it("has the correct number of collections to confirm that all collections are tracked", () => {
      const yamlContent = loadYamlFiles();
      const actualNumberOfCollections = yamlContent.length;

      expect(composeErrorMessage(expectedNumberofCollections)).toEqual(
        composeErrorMessage(actualNumberOfCollections),
      );
    });
  });
});
