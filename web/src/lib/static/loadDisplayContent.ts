import {
  DashboardDisplayContent,
  RoadmapDisplayContent,
  SidebarCardContent,
  TasksDisplayContent,
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");

export const loadRoadmapDisplayContent = (): RoadmapDisplayContent => {
  const roadmapContents = fs.readFileSync(path.join(displayContentDir, "roadmap", "roadmap.md"), "utf8");

  return {
    contentMd: getMarkdown(roadmapContents).content,
    sidebarDisplayContent: loadSidebarDisplayContent(),
  };
};

const loadSidebarDisplayContent = (): Record<string, SidebarCardContent> => {
  const fileNames = fs.readdirSync(path.join(displayContentDir, "roadmap-sidebar-cards"));

  return fileNames.reduce((acc, cur) => {
    const fileContents: string = fs.readFileSync(
      path.join(displayContentDir, "roadmap-sidebar-cards", cur),
      "utf8"
    );
    const markdownContents = getMarkdown(fileContents);
    const displayContent: SidebarCardContent = {
      contentMd: markdownContents.content,
      ...(markdownContents.grayMatter as RoadmapCardGrayMatter),
    };
    return { ...acc, [displayContent.id]: displayContent };
  }, {} as Record<string, SidebarCardContent>);
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

type DocumentFieldGrayMatter = {
  cost: number;
  optionalLabel: string;
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

type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  imgPath: string;
  color: string;
  shadowColor: string;
  hasCloseButton: boolean;
  weight: number;
};
