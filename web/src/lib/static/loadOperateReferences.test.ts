import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { OperateReference } from "@/lib/types/types";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadOperateReferences", () => {
  let mockedFs: jest.Mocked<typeof fs>;
  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  it("it returns all filings and opportunities as references", () => {
    const filingMd1 =
      "---\n" +
      'id: "some-filing-id-1"\n' +
      'filingId: "some-filingId-1"\n' +
      'urlSlug: "some-filing-url-slug-1"\n' +
      'name: "Some Filing Name1"\n' +
      'callToActionLink: "www.example1.com"\n' +
      'callToActionText: ""\n' +
      "---\n" +
      "\n" +
      "# I am a header1\n" +
      "\n" +
      "I am a text content1";

    const filingMd2 =
      "---\n" +
      'id: "some-filing-id-2"\n' +
      'filingId: "some-filingId-2"\n' +
      'urlSlug: "some-filing-url-slug-2"\n' +
      'name: "Some Filing Name2"\n' +
      'callToActionLink: "www.example2.com"\n' +
      'callToActionText: ""\n' +
      "---\n" +
      "\n" +
      "# I am a header2\n" +
      "\n" +
      "I am a text content2";

    const oppMd1 =
      "---\n" +
      'id: "some-opp-id-1"\n' +
      'urlSlug: "some-opp-url-slug-1"\n' +
      'name: "Some Opportunity Name1"\n' +
      'callToActionLink: "https://www.example.com/1"\n' +
      'callToActionText: "Click here 1"\n' +
      'type: "FUNDING" \n' +
      "---\n" +
      "Some content description 1";

    const oppMd2 =
      "---\n" +
      'id: "some-opp-id-2"\n' +
      'urlSlug: "some-opp-url-slug-2"\n' +
      'name: "Some Opportunity Name2"\n' +
      'callToActionLink: "https://www.example.com/2"\n' +
      'callToActionText: "Click here 2"\n' +
      'type: "CERTIFICATION" \n' +
      "---\n" +
      "Some content description 2";

    mockReadDirReturn(["filingMd1.md", "filingMd2.md"]); // read filing dir
    mockReadDirReturn(["oppMd1.md", "oppMd2.md"]); // read opportunity dir
    mockedFs.readFileSync
      .mockReturnValueOnce(filingMd1) // read first file in filings
      .mockReturnValueOnce(filingMd2) // read second file in filings
      .mockReturnValueOnce(oppMd1) // read first file in opportunities
      .mockReturnValueOnce(oppMd2); // read second file in opportunities

    const expectedOperateReferences: Record<string, OperateReference> = {
      "some-filing-id-1": {
        name: "Some Filing Name1",
        urlSlug: "some-filing-url-slug-1",
        urlPath: "/filings/some-filing-url-slug-1",
      },
      "some-filing-id-2": {
        name: "Some Filing Name2",
        urlSlug: "some-filing-url-slug-2",
        urlPath: "/filings/some-filing-url-slug-2",
      },
      "some-opp-id-1": {
        name: "Some Opportunity Name1",
        urlSlug: "some-opp-url-slug-1",
        urlPath: "/opportunities/some-opp-url-slug-1",
      },
      "some-opp-id-2": {
        name: "Some Opportunity Name2",
        urlSlug: "some-opp-url-slug-2",
        urlPath: "/opportunities/some-opp-url-slug-2",
      },
    };

    expect(loadOperateReferences()).toEqual(expectedOperateReferences);
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
