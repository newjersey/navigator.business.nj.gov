import fs from "fs";
import path from "path";
import { OnboardingDisplayContent, RoadmapDisplayContent } from "@/lib/types/types";
import { LegalStructures } from "@businessnjgovnavigator/shared";
import { getMarkdown } from "@/lib/utils/markdownReader";

const displayContentDir = path.join(process.cwd(), "display-content");

const loadFile = (filename: string): string =>
  fs.readFileSync(path.join(displayContentDir, "onboarding", filename), "utf8");

export const loadOnboardingDisplayContent = (): OnboardingDisplayContent => {
  const businessName = getMarkdown(loadFile("business-name.md"));
  const industry = getMarkdown(loadFile("industry.md"));
  const legalStructure = getMarkdown(loadFile("legal-structure.md"));
  const municipality = getMarkdown(loadFile("municipality.md"));
  const specificHomeContractor = getMarkdown(loadFile("industry/industry-specific/home-contractor.md"));
  const specificEmploymentAgency = getMarkdown(loadFile("industry/industry-specific/employment-agency.md"));
  const specificLiquor = getMarkdown(loadFile("industry/industry-specific/liquor.md"));
  const specificHomeBased = getMarkdown(loadFile("municipality/home-based-business.md"));
  const employerId = getMarkdown(loadFile("employer-id.md"));
  const entityId = getMarkdown(loadFile("entity-id.md"));
  const notes = getMarkdown(loadFile("notes.md"));
  const taxId = getMarkdown(loadFile("tax-id.md"));

  const legalStructureOptionContent: Record<string, string> = {};
  LegalStructures.forEach((legalStructure) => {
    legalStructureOptionContent[legalStructure.id] = getMarkdown(
      loadFile(`legal-structure/${legalStructure.id}.md`)
    ).content;
  });

  return {
    businessName: {
      contentMd: businessName.content,
      ...(businessName.grayMatter as FieldGrayMatter),
    },
    industry: {
      contentMd: industry.content,
      specificHomeContractorMd: specificHomeContractor.content,
      specificEmploymentAgencyMd: specificEmploymentAgency.content,
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
    employerId: {
      contentMd: employerId.content,
      ...(employerId.grayMatter as FieldGrayMatter),
    },
    entityId: {
      contentMd: entityId.content,
      ...(entityId.grayMatter as FieldGrayMatter),
    },
    notes: {
      contentMd: notes.content,
      ...(notes.grayMatter as FieldGrayMatter),
    },
    taxId: {
      contentMd: taxId.content,
      ...(taxId.grayMatter as FieldGrayMatter),
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
