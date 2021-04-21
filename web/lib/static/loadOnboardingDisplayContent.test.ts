import fs from "fs";
import { loadOnboardingDisplayContent } from "./loadOnboardingDisplayContent";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadOnboardingDisplayContent", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  it("returns onboarding content from markdown", async () => {
    const onboardingDisplayMd =
      "---\n" +
      'placeholder: "Fill me in"\n' +
      "---\n" +
      "\n" +
      "### I am a header\n" +
      "\n" +
      "I am a description";

    mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

    expect((await loadOnboardingDisplayContent()).municipality).toEqual({
      placeholder: "Fill me in",
      contentHtml: "<h3>I am a header</h3>\n<p>I am a description</p>\n",
    });
  });

  it("returns onboarding content with no placeholder from markdown", async () => {
    const onboardingDisplayMd =
      "---\n" + "---\n" + "\n" + "### I am a header\n" + "\n" + "I am a description";

    mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

    expect((await loadOnboardingDisplayContent()).municipality).toEqual({
      placeholder: undefined,
      contentHtml: "<h3>I am a header</h3>\n<p>I am a description</p>\n",
    });
  });
});
