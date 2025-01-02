import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { mockReadDirReturnOnce } from "@/lib/static/mockHelpers";
import { OperateReference } from "@/lib/types/types";
import fs from "fs";

vi.mock("fs");
vi.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadOperateReferences", () => {
  let mockedFs: vi.Mocked<typeof fs>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedFs = fs as vi.Mocked<typeof fs>;
  });

  it("returns all filings and fundings and certifications as references", () => {
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

    const fundingMd1 =
      "---\n" +
      'id: "some-funding-id-1"\n' +
      'urlSlug: "some-funding-url-slug-1"\n' +
      'name: "Some Funding Name1"\n' +
      'callToActionLink: "https://www.example.com/1"\n' +
      'callToActionText: "Click here 1"\n' +
      "---\n" +
      "Some content description 1";

    const fundingMd2 =
      "---\n" +
      'id: "some-funding-id-2"\n' +
      'urlSlug: "some-funding-url-slug-2"\n' +
      'name: "Some Funding Name2"\n' +
      'callToActionLink: "https://www.example.com/2"\n' +
      'callToActionText: "Click here 2"\n' +
      "---\n" +
      "Some content description 2";

    const certMd1 =
      "---\n" +
      'id: "some-cert-id-1"\n' +
      'urlSlug: "some-cert-url-slug-1"\n' +
      'name: "Some Certification Name1"\n' +
      'callToActionLink: "https://www.example.com/1"\n' +
      'callToActionText: "Click here 1"\n' +
      "---\n" +
      "Some content description 1";

    mockReadDirReturnOnce({ value: ["filingMd1.md", "filingMd2.md"], mockedFs }); // read filing dir
    mockReadDirReturnOnce({ value: ["fundingMd1.md", "fundingMd2.md"], mockedFs }); // read funding dir
    mockReadDirReturnOnce({ value: ["certMd1.md"], mockedFs }); // read certification dir

    mockedFs.readFileSync
      .mockReturnValueOnce(filingMd1) // read first file in filings
      .mockReturnValueOnce(filingMd2) // read second file in filings
      .mockReturnValueOnce(fundingMd1) // read first file in fundings
      .mockReturnValueOnce(fundingMd2) // read second file in fundings
      .mockReturnValueOnce(certMd1); // read first file in certifications

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
      "some-funding-id-1": {
        name: "Some Funding Name1",
        urlSlug: "some-funding-url-slug-1",
        urlPath: "/funding/some-funding-url-slug-1",
      },
      "some-funding-id-2": {
        name: "Some Funding Name2",
        urlSlug: "some-funding-url-slug-2",
        urlPath: "/funding/some-funding-url-slug-2",
      },
      "some-cert-id-1": {
        name: "Some Certification Name1",
        urlSlug: "some-cert-url-slug-1",
        urlPath: "/certification/some-cert-url-slug-1",
      },
    };

    expect(loadOperateReferences()).toEqual(expectedOperateReferences);
  });
});
