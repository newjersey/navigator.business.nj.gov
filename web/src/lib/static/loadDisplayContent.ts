import { ProfileDisplayContent, RoadmapDisplayContent, TasksDisplayContent } from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import { LegalStructures } from "@businessnjgovnavigator/shared";
import fs from "fs";
import path from "path";

const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");

export const loadProfileDisplayContent = (): ProfileDisplayContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, "onboarding", filename), "utf8");

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

export const loadTasksDisplayContent = (): TasksDisplayContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, "tasks", filename), "utf8");

  const businessSuffix = getMarkdown(loadFile("business-formation/business-suffix.md"));
  const businessStartDate = getMarkdown(loadFile("business-formation/business-start-date.md"));
  const businessAddressLine1 = getMarkdown(loadFile("business-formation/business-address-line1.md"));
  const businessAddressLine2 = getMarkdown(loadFile("business-formation/business-address-line2.md"));
  const businessAddressState = getMarkdown(loadFile("business-formation/business-address-state.md"));
  const businessAddressZipCode = getMarkdown(loadFile("business-formation/business-address-zip-code.md"));

  const agentNumberOrManual = getMarkdown(loadFile("business-formation/registered-agent.md"));
  const agentNumber = getMarkdown(loadFile("business-formation/registered-agent-number.md"));
  const agentName = getMarkdown(loadFile("business-formation/registered-agent-name.md"));
  const agentEmail = getMarkdown(loadFile("business-formation/registered-agent-email.md"));
  const agentOfficeAddressLine1 = getMarkdown(loadFile("business-formation/registered-agent-address-1.md"));
  const agentOfficeAddressLine2 = getMarkdown(loadFile("business-formation/registered-agent-address-2.md"));
  const agentOfficeAddressCity = getMarkdown(loadFile("business-formation/registered-agent-city.md"));
  const agentOfficeAddressState = getMarkdown(loadFile("business-formation/registered-agent-state.md"));
  const agentOfficeAddressZipCode = getMarkdown(loadFile("business-formation/registered-agent-zip.md"));

  return {
    formationDisplayContent: {
      businessSuffix: {
        contentMd: businessSuffix.content,
        ...(businessSuffix.grayMatter as FieldGrayMatter),
      },
      businessStartDate: {
        contentMd: businessStartDate.content,
      },
      businessAddressLine1: {
        contentMd: businessAddressLine1.content,
        ...(businessAddressLine1.grayMatter as FieldGrayMatter),
      },
      businessAddressLine2: {
        contentMd: businessAddressLine2.content,
        ...(businessAddressLine2.grayMatter as FieldGrayMatter),
      },
      businessAddressState: {
        contentMd: businessAddressState.content,
        ...(businessAddressState.grayMatter as FieldGrayMatter),
      },
      businessAddressZipCode: {
        contentMd: businessAddressZipCode.content,
        ...(businessAddressZipCode.grayMatter as FieldGrayMatter),
      },
      agentNumberOrManual: {
        contentMd: agentNumberOrManual.content,
        radioButtonNumberText: (agentNumberOrManual.grayMatter as RegisteredAgentRadioGrayMatter)
          .radioButtonNumberText,
        radioButtonManualText: (agentNumberOrManual.grayMatter as RegisteredAgentRadioGrayMatter)
          .radioButtonManualText,
      },
      agentNumber: {
        contentMd: agentNumber.content,
        ...(agentNumber.grayMatter as FieldGrayMatter),
      },
      agentName: {
        contentMd: agentName.content,
        ...(agentName.grayMatter as FieldGrayMatter),
      },
      agentEmail: {
        contentMd: agentEmail.content,
        ...(agentEmail.grayMatter as FieldGrayMatter),
      },
      agentOfficeAddressLine1: {
        contentMd: agentOfficeAddressLine1.content,
        ...(agentOfficeAddressLine1.grayMatter as FieldGrayMatter),
      },
      agentOfficeAddressLine2: {
        contentMd: agentOfficeAddressLine2.content,
        ...(agentOfficeAddressLine2.grayMatter as FieldGrayMatter),
      },
      agentOfficeAddressCity: {
        contentMd: agentOfficeAddressCity.content,
        ...(agentOfficeAddressCity.grayMatter as FieldGrayMatter),
      },
      agentOfficeAddressState: {
        contentMd: agentOfficeAddressState.content,
        ...(agentOfficeAddressState.grayMatter as FieldGrayMatter),
      },
      agentOfficeAddressZipCode: {
        contentMd: agentOfficeAddressZipCode.content,
        ...(agentOfficeAddressZipCode.grayMatter as FieldGrayMatter),
      },
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

type RegisteredAgentRadioGrayMatter = {
  radioButtonNumberText: string;
  radioButtonManualText: string;
};
