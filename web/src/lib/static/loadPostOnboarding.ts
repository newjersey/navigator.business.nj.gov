import { PostOnboardingFile } from "@/lib/types/types";
import { convertPostOnboardingMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const postOnboardingDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "display-content",
  "post-onboarding",
);

export const loadAllPostOnboarding = (): PostOnboardingFile[] => {
  const fileNames = fs.readdirSync(postOnboardingDir);
  return fileNames.map((fileName) => {
    const fullPath = path.join(postOnboardingDir, `${fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const fileNameWithoutMd = fileName.split(".md")[0];
    return convertPostOnboardingMd(fileContents, fileNameWithoutMd);
  });
};
