import {
  DashboardDisplayContent,
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
  RoadmapSideBarContent,
  startFlowDisplayFields,
  StartingFlowContent,
  TasksDisplayContent,
  TextFieldContent,
  UserContentType,
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import { LegalStructure, LegalStructures } from "@businessnjgovnavigator/shared/";
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

  const industryId = (type: UserContentType): IndustryFieldContent => {
    const industryContent = getMarkdown(loadFile("industry.md", type));
    const specificCpa = getMarkdown(loadFile("industry-cpa.md", type));
    const specificHomeContractor = getMarkdown(loadFile("industry-home-contractor.md", type));
    const specificEmploymentAgency = getMarkdown(loadFile("industry-employment-agency.md", type));
    const specificLiquor = getMarkdown(loadFile("industry-liquor.md", type));
    const specificCannabis = getMarkdown(loadFile("industry-cannabis.md", type));
    return {
      contentMd: industryContent.content,
      specificHomeContractorMd: specificHomeContractor.content,
      specificEmploymentAgencyMd: specificEmploymentAgency.content,
      specificLiquorQuestion: {
        contentMd: specificLiquor.content,
        radioButtonYesText: (specificLiquor.grayMatter as RadioGrayMatter).radioButtonYesText,
        radioButtonNoText: (specificLiquor.grayMatter as RadioGrayMatter).radioButtonNoText,
      },
      specificCannabisLicenseQuestion: {
        contentMd: specificCannabis.content,
        radioButtonAnnualText: (specificCannabis.grayMatter as CannabisRadioGrayMatter).radioButtonAnnualText,
        radioButtonConditionalText: (specificCannabis.grayMatter as CannabisRadioGrayMatter)
          .radioButtonConditionalText,
      },
      specificCpaQuestion: {
        contentMd: specificCpa.content,
        radioButtonYesText: (specificCpa.grayMatter as RadioGrayMatter).radioButtonYesText,
        radioButtonNoText: (specificCpa.grayMatter as RadioGrayMatter).radioButtonNoText,
      },
      ...(industryContent.grayMatter as FieldGrayMatter),
    };
  };

  const legalStructure = (type: UserContentType): LegalFieldContent => {
    const legalStructureContent = getMarkdown(loadFile("legal-structure.md", type));
    const legalStructureOptionContent: Record<string, string> = {};
    LegalStructures.forEach((structure: LegalStructure) => {
      try {
        legalStructureOptionContent[structure.id] = getMarkdown(
          loadFile(`legal-structure-${structure.id}.md`, type)
        ).content;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    });

    return {
      contentMd: legalStructureContent.content,
      optionContent: legalStructureOptionContent,
      ...(legalStructureContent.grayMatter as FieldGrayMatter),
    };
  };

  const hasExistingBusiness = (type: UserContentType) =>
    getRadioFieldContent("has-existing-business.md", type);
  const businessName = (type: UserContentType) => getTextFieldContent("business-name.md", type);
  const municipality = (type: UserContentType) => getTextFieldContent("municipality.md", type);
  const employerId = (type: UserContentType) => getTextFieldContent("employer-id.md", type);
  const dateOfFormation = (type: UserContentType) => getTextFieldContent("date-of-formation.md", type);
  const entityId = (type: UserContentType) => getTextFieldContent("entity-id.md", type);
  const notes = (type: UserContentType) => getTextFieldContent("notes.md", type);
  const taxId = (type: UserContentType) => getTextFieldContent("tax-id.md", type);
  const documents = (type: UserContentType) => getTextFieldContent("documents.md", type);
  const ownership = (type: UserContentType) => getTextFieldContent("ownership.md", type);
  const existingEmployees = (type: UserContentType) => getTextFieldContent("existing-employees.md", type);
  const taxPin = (type: UserContentType) => getTextFieldContent("tax-pin.md", type);
  const sectorId = (type: UserContentType) => getTextFieldContent("sector-id.md", type);
  const homeBased = (type: UserContentType) =>
    getTextFieldContent("municipality-home-based-business.md", type);

  const fieldFunctions: Record<
    keyof StartingFlowContent | keyof OwningFlowContent | keyof ProfileContent,
    (type: UserContentType) => LegalFieldContent | RadioFieldContent | IndustryFieldContent | TextFieldContent
  > = {
    hasExistingBusiness,
    businessName,
    municipality,
    employerId,
    dateOfFormation,
    entityId,
    notes,
    taxId,
    ownership,
    existingEmployees,
    documents,
    industryId,
    legalStructure,
    taxPin,
    sectorId,
    homeBased,
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

export const loadRoadmapSidebarDisplayContent = (): RoadmapSideBarContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, "roadmap-sidebar-cards", filename), "utf8");

  const welcomeCardContent = getMarkdown(loadFile("welcome.md"));
  const welcomeCardGpOrSpContent = getMarkdown(loadFile("welcome-gp-or-sp.md"));

  const guestSuccessfullyRegisteredContent = getMarkdown(loadFile("successful-registration.md"));
  const guestNotRegisteredContent = getMarkdown(loadFile("not-registered.md"));

  return {
    welcomeCard: {
      contentMd: welcomeCardContent.content,
      ...(welcomeCardContent.grayMatter as RoadmapCardGrayMatter),
    },
    welcomeCardGpOrSpCard: {
      contentMd: welcomeCardGpOrSpContent.content,
      ...(welcomeCardGpOrSpContent.grayMatter as RoadmapCardGrayMatter),
    },
    guestSuccessfullyRegisteredCard: {
      contentMd: guestSuccessfullyRegisteredContent.content,
      ...(guestSuccessfullyRegisteredContent.grayMatter as RoadmapCardGrayMatter),
    },
    guestNotRegisteredCard: {
      contentMd: guestNotRegisteredContent.content,
      ...(guestNotRegisteredContent.grayMatter as RoadmapCardGrayMatter),
    },
  };
};

export const loadRoadmapDisplayContent = (): RoadmapDisplayContent => {
  const roadmapContents = fs.readFileSync(path.join(displayContentDir, "roadmap", "roadmap.md"), "utf8");

  return {
    contentMd: getMarkdown(roadmapContents).content,
  };
};

export const loadDashboardDisplayContent = (): DashboardDisplayContent => {
  const introTextContent = fs.readFileSync(
    path.join(displayContentDir, "dashboard", "intro-text.md"),
    "utf8"
  );
  const opportunityTextContent = fs.readFileSync(
    path.join(displayContentDir, "dashboard", "opportunity-text.md"),
    "utf8"
  );

  return {
    introTextMd: getMarkdown(introTextContent).content,
    opportunityTextMd: getMarkdown(opportunityTextContent).content,
  };
};

export const loadTasksDisplayContent = (): TasksDisplayContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, filename), "utf8");

  const introParagraph = getMarkdown(loadFile("business-formation/form-business-entity-intro.md"));
  const businessNameCheck = getMarkdown(loadFile("business-formation/business-name-check.md"));
  const services = getMarkdown(loadFile("business-formation/services.md"));
  const officialFormationDocument = getMarkdown(loadFile("business-formation/doc-official-formation.md"));
  const certificateOfStanding = getMarkdown(loadFile("business-formation/doc-certificate-of-standing.md"));
  const certifiedCopyOfFormationDocument = getMarkdown(
    loadFile("business-formation/doc-certified-copy-of-formation-document.md")
  );

  const notification = getMarkdown(loadFile("business-formation/notification.md"));

  const agentNumberOrManual = getMarkdown(loadFile("business-formation/registered-agent.md"));

  const members = getMarkdown(loadFile("business-formation/members.md"));

  const signatureHeader = getMarkdown(loadFile("business-formation/signatures.md"));

  const socialEquityPriority = getMarkdown(
    loadFile("cannabis-priority-status/cannabis-social-equity-business.md")
  );
  const minorityWomenOwnedPriority = getMarkdown(
    loadFile("cannabis-priority-status/cannabis-minority-and-women-owned.md")
  );
  const veteranOwnedPriority = getMarkdown(loadFile("cannabis-priority-status/cannabis-veteran-owned.md"));

  const annualGeneralRequirements = getMarkdown(loadFile("cannabis-license/annual-general-requirements.md"));
  const conditionalGeneralRequirements = getMarkdown(
    loadFile("cannabis-license/conditional-general-requirements.md")
  );
  const divereselyOwnedRequirements = getMarkdown(
    loadFile("cannabis-license/diversely-owned-requirements.md")
  );
  const impactZoneRequirements = getMarkdown(loadFile("cannabis-license/impact-zone-requirements.md"));
  const microbusinessRequirements = getMarkdown(loadFile("cannabis-license/microbusiness-requirements.md"));
  const socialEquityRequirements = getMarkdown(loadFile("cannabis-license/social-equity-requirements.md"));
  const conditionalBottomOfTask = getMarkdown(loadFile("cannabis-license/conditional-bottom-of-task.md"));
  const annualBottomOfTask = getMarkdown(loadFile("cannabis-license/annual-bottom-of-task.md"));

  return {
    formationDisplayContent: {
      introParagraph: {
        contentMd: introParagraph.content,
      },
      businessNameCheck: {
        contentMd: businessNameCheck.content,
      },
      agentNumberOrManual: {
        contentMd: agentNumberOrManual.content,
        radioButtonNumberText: (agentNumberOrManual.grayMatter as RegisteredAgentRadioGrayMatter)
          .radioButtonNumberText,
        radioButtonManualText: (agentNumberOrManual.grayMatter as RegisteredAgentRadioGrayMatter)
          .radioButtonManualText,
      },
      members: {
        contentMd: members.content,
        ...(members.grayMatter as MemberGrayMatter),
      },
      signatureHeader: {
        contentMd: signatureHeader.content,
      },
      services: {
        contentMd: services.content,
      },
      notification: {
        contentMd: notification.content,
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
    },
    cannabisPriorityStatusDisplayContent: {
      socialEquityBusiness: { contentMd: socialEquityPriority.content },
      minorityAndWomenOwned: { contentMd: minorityWomenOwnedPriority.content },
      veteranOwned: { contentMd: veteranOwnedPriority.content },
    },
    cannabisApplyForLicenseDisplayContent: {
      annualGeneralRequirements: { contentMd: annualGeneralRequirements.content },
      conditionalGeneralRequirements: { contentMd: conditionalGeneralRequirements.content },
      diverselyOwnedRequirements: { contentMd: divereselyOwnedRequirements.content },
      impactZoneRequirements: { contentMd: impactZoneRequirements.content },
      microbusinessRequirements: { contentMd: microbusinessRequirements.content },
      socialEquityRequirements: { contentMd: socialEquityRequirements.content },
      conditionalBottomOfTask: { contentMd: conditionalBottomOfTask.content },
      annualBottomOfTask: { contentMd: annualBottomOfTask.content },
    },
  };
};

type FieldGrayMatter = {
  placeholder: string;
};

type DocumentFieldGrayMatter = {
  cost: number;
  optionalLabel: string;
};

type RadioGrayMatter = {
  radioButtonYesText: string;
  radioButtonNoText: string;
};

type CannabisRadioGrayMatter = {
  radioButtonAnnualText: string;
  radioButtonConditionalText: string;
};

type RegisteredAgentRadioGrayMatter = {
  radioButtonNumberText: string;
  radioButtonManualText: string;
};

type MemberGrayMatter = {
  title: string;
  titleSubtext: string;
  placeholder: string;
};

export type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  imgPath: string;
  color: string;
  shadowColor: string;
};
