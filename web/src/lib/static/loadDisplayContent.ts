import {
  emptyOwningFlowContent,
  emptyStartingFlowContent,
  IndustryFieldContent,
  LegalFieldContent,
  LoadDisplayContent,
  OwningFlowContent,
  owningFlowDisplayFields,
  ProfileContent,
  profileDisplayFields,
  RadioFieldContent,
  RoadmapDisplayContent,
  startFlowDisplayFields,
  StartingFlowContent,
  TasksDisplayContent,
  TextFieldContent,
  UserContentType,
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import { LegalStructures } from "@businessnjgovnavigator/shared";
import fs from "fs";
import path from "path";

const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");
const onboardingContentFolder: Record<UserContentType, string> = {
  OWNING: "owning",
  STARTING: "starting",
  PROFILE: "profile",
};

export const loadUserDisplayContent = (): LoadDisplayContent => {
  const getPath = (filename: string, type: UserContentType): string =>
    path.join(displayContentDir, "onboarding", onboardingContentFolder[type], filename);
  const loadFile = (filename: string, type: UserContentType): string =>
    fs.readFileSync(getPath(filename, type), "utf8");

  const getRadioFieldContent = (filename: string, type: UserContentType): RadioFieldContent => {
    const markdown = getMarkdown(loadFile(filename, type));
    return {
      contentMd: markdown.content,
      radioButtonYesText: (markdown.grayMatter as RadioGrayMatter).radioButtonYesText,
      radioButtonNoText: (markdown.grayMatter as RadioGrayMatter).radioButtonNoText,
    };
  };
  const getTextFieldContent = (filename: string, type: UserContentType): TextFieldContent => {
    const markdown = getMarkdown(loadFile(filename, type));
    return {
      contentMd: markdown.content,
      ...(markdown.grayMatter as FieldGrayMatter),
    };
  };

  const industry = (type: UserContentType): IndustryFieldContent => {
    const industryContent = getMarkdown(loadFile("industry.md", type));
    const specificHomeContractor = getMarkdown(loadFile("industry-home-contractor.md", type));
    const specificEmploymentAgency = getMarkdown(loadFile("industry-employment-agency.md", type));
    const specificLiquor = getMarkdown(loadFile("industry-liquor.md", type));
    const specificHomeBased = getMarkdown(loadFile("municipality-home-based-business.md", type));
    return {
      contentMd: industryContent.content,
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
      ...(industryContent.grayMatter as FieldGrayMatter),
    };
  };

  const legalStructure = (type: UserContentType): LegalFieldContent => {
    const legalStructureContent = getMarkdown(loadFile("legal-structure.md", type));
    const legalStructureOptionContent: Record<string, string> = {};
    LegalStructures.forEach((structure) => {
      legalStructureOptionContent[structure.id] = getMarkdown(
        loadFile(`legal-structure-${structure.id}.md`, type)
      ).content;
    });
    return {
      contentMd: legalStructureContent.content,
      optionContent: legalStructureOptionContent,
    };
  };

  const hasExistingBusiness = (type: UserContentType) =>
    getRadioFieldContent("has-existing-business.md", type);
  const businessName = (type: UserContentType) => getTextFieldContent("business-name.md", type);
  const municipality = (type: UserContentType) => getTextFieldContent("municipality.md", type);
  const employerId = (type: UserContentType) => getTextFieldContent("employer-id.md", type);
  const entityId = (type: UserContentType) => getTextFieldContent("entity-id.md", type);
  const notes = (type: UserContentType) => getTextFieldContent("notes.md", type);
  const taxId = (type: UserContentType) => getTextFieldContent("tax-id.md", type);
  const certifications = (type: UserContentType) => getTextFieldContent("certifications.md", type);
  const existingEmployees = (type: UserContentType) => getTextFieldContent("existing-employees.md", type);

  const fieldFunctions: Record<
    keyof StartingFlowContent | keyof OwningFlowContent | keyof ProfileContent,
    (type: UserContentType) => LegalFieldContent | RadioFieldContent | IndustryFieldContent | TextFieldContent
  > = {
    hasExistingBusiness,
    businessName,
    municipality,
    employerId,
    entityId,
    notes,
    taxId,
    certifications,
    existingEmployees,
    industry,
    legalStructure,
  };

  const startingFlowContent: StartingFlowContent = Object.keys(fieldFunctions)
    .filter((name) => {
      return startFlowDisplayFields.includes(name as keyof StartingFlowContent);
    })
    .reduce(
      (content, name) => ({
        ...content,
        [name as keyof StartingFlowContent]: fieldFunctions[name as keyof StartingFlowContent]("STARTING"),
      }),
      emptyStartingFlowContent
    );

  const profileContent: Partial<ProfileContent> = Object.keys(fieldFunctions)
    .filter((name) => profileDisplayFields.includes(name as keyof ProfileContent))
    .reduce((content, name) => {
      try {
        return {
          ...content,
          [name as keyof ProfileContent]: fieldFunctions[name as keyof ProfileContent]("PROFILE"),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.code !== "ENOENT") {
          throw error;
        }
        return content;
      }
    }, {});

  const owningFlowContent: OwningFlowContent = Object.keys(fieldFunctions)
    .filter((name) => owningFlowDisplayFields.includes(name as keyof OwningFlowContent))
    .reduce(
      (content, name) => ({
        ...content,
        [name as keyof OwningFlowContent]: fieldFunctions[name as keyof OwningFlowContent]("OWNING"),
      }),
      emptyOwningFlowContent
    );

  return { OWNING: owningFlowContent, STARTING: startingFlowContent, PROFILE: profileContent };
};

export const loadRoadmapDisplayContent = (): RoadmapDisplayContent => {
  const roadmapContents = fs.readFileSync(path.join(displayContentDir, "roadmap", "roadmap.md"), "utf8");
  const readOperateContent = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, "roadmap", filename), "utf8");

  return {
    contentMd: getMarkdown(roadmapContents).content,
    operateDisplayContent: {
      entityIdMd: getMarkdown(readOperateContent("operate-entity-id-form.md")).content,
      filingCalendarMd: getMarkdown(readOperateContent("operate-filing-calendar.md")).content,
      entityIdErrorNotRegisteredMd: getMarkdown(
        readOperateContent("operate-entity-id-error-not-registered.md")
      ).content,
      entityIdErrorNotFoundMd: getMarkdown(readOperateContent("operate-entity-id-error-not-found.md"))
        .content,
    },
  };
};

export const loadTasksDisplayContent = (): TasksDisplayContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, filename), "utf8");

  const businessNameAndLegalStructure = getMarkdown(
    loadFile("business-formation/business-name-and-legal-structure.md")
  );
  const businessSuffix = getMarkdown(loadFile("business-formation/business-suffix.md"));
  const businessStartDate = getMarkdown(loadFile("business-formation/business-start-date.md"));
  const businessAddressLine1 = getMarkdown(loadFile("business-formation/business-address-line1.md"));
  const businessAddressLine2 = getMarkdown(loadFile("business-formation/business-address-line2.md"));
  const businessAddressState = getMarkdown(loadFile("business-formation/business-address-state.md"));
  const businessAddressZipCode = getMarkdown(loadFile("business-formation/business-address-zip-code.md"));
  const paymentType = getMarkdown(loadFile("business-formation/payment-type.md"));
  const disclaimer = getMarkdown(loadFile("business-formation/disclaimer.md"));
  const officialFormationDocument = getMarkdown(loadFile("business-formation/doc-official-formation.md"));
  const certificateOfStanding = getMarkdown(loadFile("business-formation/doc-certificate-of-standing.md"));
  const certifiedCopyOfFormationDocument = getMarkdown(
    loadFile("business-formation/doc-certified-copy-of-formation-document.md")
  );

  const notification = getMarkdown(loadFile("business-formation/notification.md"));
  const optInAnnualReport = getMarkdown(loadFile("business-formation/opt-in-annual-report.md"));
  const optInCorpWatch = getMarkdown(loadFile("business-formation/opt-in-corp-watch.md"));

  const agentNumberOrManual = getMarkdown(loadFile("business-formation/registered-agent.md"));
  const agentNumber = getMarkdown(loadFile("business-formation/registered-agent-number.md"));
  const agentName = getMarkdown(loadFile("business-formation/registered-agent-name.md"));
  const agentEmail = getMarkdown(loadFile("business-formation/registered-agent-email.md"));
  const agentOfficeAddressLine1 = getMarkdown(loadFile("business-formation/registered-agent-address-1.md"));
  const agentOfficeAddressLine2 = getMarkdown(loadFile("business-formation/registered-agent-address-2.md"));
  const agentOfficeAddressCity = getMarkdown(loadFile("business-formation/registered-agent-city.md"));
  const agentOfficeAddressState = getMarkdown(loadFile("business-formation/registered-agent-state.md"));
  const agentOfficeAddressZipCode = getMarkdown(loadFile("business-formation/registered-agent-zip.md"));
  const signer = getMarkdown(loadFile("business-formation/signatures.md"));
  const additionalSigners = getMarkdown(loadFile("business-formation/additional-signers.md"));
  const contactFirstName = getMarkdown(loadFile("business-formation/contact-first-name.md"));
  const contactLastName = getMarkdown(loadFile("business-formation/contact-last-name.md"));
  const contactPhoneNumber = getMarkdown(loadFile("business-formation/contact-phone-number.md"));

  return {
    formationDisplayContent: {
      businessNameAndLegalStructure: {
        contentMd: businessNameAndLegalStructure.content,
      },
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
      signer: {
        contentMd: signer.content,
        ...(signer.grayMatter as FieldGrayMatter),
      },
      additionalSigners: {
        contentMd: additionalSigners.content,
        ...(additionalSigners.grayMatter as FieldGrayMatter),
      },
      paymentType: {
        contentMd: paymentType.content,
        ...(paymentType.grayMatter as FieldGrayMatter),
      },
      disclaimer: {
        contentMd: disclaimer.content,
      },
      notification: {
        contentMd: notification.content,
      },
      optInAnnualReport: {
        contentMd: optInAnnualReport.content,
      },
      optInCorpWatch: {
        contentMd: optInCorpWatch.content,
      },
      officialFormationDocument: {
        contentMd: officialFormationDocument.content,
        ...(officialFormationDocument.grayMatter as DocumentFieldGrayMatter),
      },
      certificateOfStanding: {
        contentMd: certificateOfStanding.content,
        ...(certificateOfStanding.grayMatter as DocumentFieldGrayMatter),
      },
      certifiedCopyOfFormationDocument: {
        contentMd: certifiedCopyOfFormationDocument.content,
        ...(certifiedCopyOfFormationDocument.grayMatter as DocumentFieldGrayMatter),
      },
      contactFirstName: {
        contentMd: contactFirstName.content,
        ...(contactFirstName.grayMatter as FieldGrayMatter),
      },
      contactLastName: {
        contentMd: contactLastName.content,
        ...(contactLastName.grayMatter as FieldGrayMatter),
      },
      contactPhoneNumber: {
        contentMd: contactPhoneNumber.content,
        ...(contactPhoneNumber.grayMatter as FieldGrayMatter),
      },
    },
  };
};

type FieldGrayMatter = {
  placeholder: string;
};

type DocumentFieldGrayMatter = {
  cost: string;
  optionalLabel: string;
};

type RadioGrayMatter = {
  radioButtonYesText: string;
  radioButtonNoText: string;
};

type RegisteredAgentRadioGrayMatter = {
  radioButtonNumberText: string;
  radioButtonManualText: string;
};
