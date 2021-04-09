import fs from "fs";
import path from "path";
import { FieldDisplayContent, OnboardingDisplayContent, WelcomeDisplayContent } from "../types/types";

const displayContentDir = path.join(process.cwd(), "display-content");

export const getOnboardingDisplayContent = (): OnboardingDisplayContent => {
  const welcomePath = path.join(displayContentDir, "onboarding", "welcome.json");
  const welcome = JSON.parse(fs.readFileSync(welcomePath, "utf8")) as WelcomeDisplayContent;

  const businessNamePath = path.join(displayContentDir, "onboarding", "business-name.json");
  const businessName = JSON.parse(fs.readFileSync(businessNamePath, "utf8")) as FieldDisplayContent;

  const industryPath = path.join(displayContentDir, "onboarding", "industry.json");
  const industry = JSON.parse(fs.readFileSync(industryPath, "utf8")) as FieldDisplayContent;

  const legalStructurePath = path.join(displayContentDir, "onboarding", "legal-structure.json");
  const legalStructure = JSON.parse(fs.readFileSync(legalStructurePath, "utf8")) as FieldDisplayContent;

  return {
    welcome,
    businessName,
    industry,
    legalStructure,
  };
};
