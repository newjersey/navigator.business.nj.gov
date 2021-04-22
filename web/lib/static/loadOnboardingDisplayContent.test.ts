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
      contentMd: "\n### I am a header\n\nI am a description",
    });
  });

  it("returns onboarding content with no placeholder from markdown", async () => {
    const onboardingDisplayMd =
      "---\n" + "---\n" + "\n" + "### I am a header\n" + "\n" + "I am a description";

    mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

    expect((await loadOnboardingDisplayContent()).municipality).toEqual({
      placeholder: undefined,
      contentMd: "\n### I am a header\n\nI am a description",
    });
  });
});
