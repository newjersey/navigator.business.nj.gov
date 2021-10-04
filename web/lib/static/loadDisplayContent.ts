import fs from "fs";
import path from "path";
import { LegalStructure, OnboardingDisplayContent, RoadmapDisplayContent } from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import { ALL_LEGAL_STRUCTURES_ORDERED } from "@/display-content/LegalStructureLookup";

const displayContentDir = path.join(process.cwd(), "display-content");

const loadFile = (filename: string): string =>
  fs.readFileSync(path.join(displayContentDir, "onboarding", filename), "utf8");

export const loadOnboardingDisplayContent = (): OnboardingDisplayContent => {
  const businessName = getMarkdown(loadFile("business-name.md"));
  const industry = getMarkdown(loadFile("industry.md"));
  const legalStructure = getMarkdown(loadFile("legal-structure.md"));
  const municipality = getMarkdown(loadFile("municipality.md"));
  const industryInfoAlert = getMarkdown(loadFile("industry/info-alert.md"));
  const specificHomeContractor = getMarkdown(loadFile("industry/industry-specific/home-contractor.md"));
  const specificLiquor = getMarkdown(loadFile("industry/industry-specific/liquor.md"));
  const specificHomeBased = getMarkdown(loadFile("municipality/home-based-business.md"));

  const legalStructureOptionContent: Record<LegalStructure, string> = ALL_LEGAL_STRUCTURES_ORDERED.reduce(
    (acc, legalStructure) => {
      acc[legalStructure] = getMarkdown(loadFile(`legal-structure/${legalStructure}.md`)).content;
      return acc;
    },
    {
      "sole-proprietorship": "",
      "general-partnership": "",
      "limited-partnership": "",
      "limited-liability-partnership": "",
      "limited-liability-company": "",
      "c-corporation": "",
    }
  );

  return {
    businessName: {
      contentMd: businessName.content,
      ...(businessName.grayMatter as FieldGrayMatter),
    },
    industry: {
      contentMd: industry.content,
      infoAlertMd: industryInfoAlert.content,
      specificHomeContractorMd: specificHomeContractor.content,
      specificLiquorQuestion: {
        contentMd: specificLiquor.content,
        radioButtonYesText: (specificLiquor.grayMatter as RadioGrayMatter).radioButtonYesText,
        radioButtonNoText: (specificLiquor.grayMatter as RadioGrayMatter).radioButtonNoText,
      },
      specificHomeBasedBusinessQuestion: {
        contentMd: specificHomeBased.content,
        radioButtonYesText: (specificHomeBased.grayMatter as RadioGrayMatter).radioButtonYesText,
        radioButtonNoText: (specificHomeBased.grayMatter as RadioGrayMatter).radioButtonNoText,
      },
      ...(industry.grayMatter as FieldGrayMatter),
    },
    legalStructure: {
      contentMd: legalStructure.content,
      optionContent: legalStructureOptionContent,
    },
    municipality: {
      contentMd: municipality.content,
      ...(municipality.grayMatter as FieldGrayMatter),
    },
  };
};

export const loadRoadmapDisplayContent = (): RoadmapDisplayContent => {
  const roadmapContents = fs.readFileSync(path.join(displayContentDir, "roadmap", "roadmap.md"), "utf8");
  const datepickerContent = fs.readFileSync(
    path.join(displayContentDir, "roadmap", "operate", "date-of-formation-form.md"),
    "utf8"
  );
  const annualFilingContent = fs.readFileSync(
    path.join(displayContentDir, "roadmap", "operate", "annual-filing.md"),
    "utf8"
  );

  return {
    contentMd: getMarkdown(roadmapContents).content,
    operateDisplayContent: {
      dateOfFormationMd: getMarkdown(datepickerContent).content,
      annualFilingMd: getMarkdown(annualFilingContent).content,
    },
  };
};

type FieldGrayMatter = {
  placeholder: string;
};

type RadioGrayMatter = {
  radioButtonYesText: string;
  radioButtonNoText: string;
};
