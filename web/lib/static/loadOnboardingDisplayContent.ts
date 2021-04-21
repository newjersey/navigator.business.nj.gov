import fs from "fs";
import path from "path";
import { OnboardingDisplayContent } from "../types/types";
import { convertFieldDisplayContentMd } from "../utils/markdownConverter";

const displayContentDir = path.join(process.cwd(), "display-content");

export const loadOnboardingDisplayContent = async (): Promise<OnboardingDisplayContent> => {
  const businessNameContents = fs.readFileSync(
    path.join(displayContentDir, "onboarding", "business-name.md"),
    "utf8"
  );
  const businessName = await convertFieldDisplayContentMd(businessNameContents);

  const industryContents = fs.readFileSync(path.join(displayContentDir, "onboarding", "industry.md"), "utf8");
  const industry = await convertFieldDisplayContentMd(industryContents);

  const legalStructureContents = fs.readFileSync(
    path.join(displayContentDir, "onboarding", "legal-structure.md"),
    "utf8"
  );
  const legalStructure = await convertFieldDisplayContentMd(legalStructureContents);

  const municipalityContents = fs.readFileSync(
    path.join(displayContentDir, "onboarding", "municipality.md"),
    "utf8"
  );
  const municipality = await convertFieldDisplayContentMd(municipalityContents);

  return {
    businessName,
    industry,
    legalStructure,
    municipality,
  };
};
