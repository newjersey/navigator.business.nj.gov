import fs from "fs";
import path from "path";
import { ProfileDisplayContent, RoadmapDisplayContent } from "@/lib/types/types";
import { LegalStructures } from "@businessnjgovnavigator/shared";
import { getMarkdown } from "@/lib/utils/markdownReader";

const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");

const loadFile = (filename: string): string =>
  fs.readFileSync(path.join(displayContentDir, "onboarding", filename), "utf8");

export const loadProfileDisplayContent = (): ProfileDisplayContent => {
  const hasExistingBusiness = getMarkdown(loadFile("has-existing-business.md"));
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
  const certifications = getMarkdown(loadFile("certifications.md"));
  const existingEmployees = getMarkdown(loadFile("existing-employees.md"));

  const legalStructureOptionContent: Record<string, string> = {};
  LegalStructures.forEach((legalStructure) => {
    legalStructureOptionContent[legalStructure.id] = getMarkdown(
      loadFile(`legal-structure/${legalStructure.id}.md`)
    ).content;
  });

  return {
    hasExistingBusiness: {
      contentMd: hasExistingBusiness.content,
      radioButtonYesText: (hasExistingBusiness.grayMatter as RadioGrayMatter).radioButtonYesText,
      radioButtonNoText: (hasExistingBusiness.grayMatter as RadioGrayMatter).radioButtonNoText,
    },
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
    certifications: {
      contentMd: certifications.content,
      ...(certifications.grayMatter as FieldGrayMatter),
    },
    existingEmployees: {
      contentMd: existingEmployees.content,
      placeholder: (existingEmployees.grayMatter as FieldGrayMatter).placeholder,
    },
  };
};

export const loadRoadmapDisplayContent = (): RoadmapDisplayContent => {
  const roadmapContents = fs.readFileSync(path.join(displayContentDir, "roadmap", "roadmap.md"), "utf8");
  const readOperateContent = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, "roadmap", "operate", filename), "utf8");

  return {
    contentMd: getMarkdown(roadmapContents).content,
    operateDisplayContent: {
      entityIdMd: getMarkdown(readOperateContent("entity-id-form.md")).content,
      filingCalendarMd: getMarkdown(readOperateContent("filing-calendar.md")).content,
      entityIdErrorNotRegisteredMd: getMarkdown(readOperateContent("entity-id-error-not-registered.md"))
        .content,
      entityIdErrorNotFoundMd: getMarkdown(readOperateContent("entity-id-error-not-found.md")).content,
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
