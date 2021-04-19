import fs from "fs";
import { getTaskById } from "./getTaskById";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("getTaskById", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });
  it("returns task entity from markdown", async () => {
    const taskMd =
      "---\n" +
      '"id": "some-id"\n' +
      '"name": "Some Task Name"\n' +
      '"destinationText": ""\n' +
      '"callToActionLink": "www.example.com"\n' +
      '"callToActionText": ""\n' +
      "---\n" +
      "\n" +
      "# I am a header\n" +
      "\n" +
      "I am a text content";

    mockedFs.readFileSync.mockReturnValueOnce(taskMd);

    expect(await getTaskById("some-id")).toEqual({
      id: "some-id",
      name: "Some Task Name",
      destinationText: "",
      callToActionLink: "www.example.com",
      callToActionText: "",
      contentHtml: "<h1>I am a header</h1>\n<p>I am a text content</p>\n",
    });
  });
});
