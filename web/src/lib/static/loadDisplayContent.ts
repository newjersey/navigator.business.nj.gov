import {
  DashboardDisplayContent,
  FormationDisplayContent,
  FormationDisplayContentMap,
  RoadmapDisplayContent,
  SidebarCardContent,
  TasksDisplayContent,
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import {
  defaultFormationLegalType,
  FormationLegalType,
  FormationLegalTypes,
} from "@businessnjgovnavigator/shared/";
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
  const opportunityTextContent = fs.readFileSync(
    path.join(displayContentDir, "dashboard", "opportunity-text.md"),
    "utf8"
  );

  return {
    opportunityTextMd: getMarkdown(opportunityTextContent).content,
  };
};

const getFormationFields = (
  legalId: FormationLegalType,
  defaultStore?: FormationDisplayContent
): FormationDisplayContent => {
  const getPath = (filename: string, type?: FormationLegalType): string =>
    path.join(displayContentDir, "business-formation", type ?? "", filename);

  const loadFile = (filename: string, type?: FormationLegalType): string =>
    fs.readFileSync(getPath(filename, type), "utf8");

  const getTextFieldContent = (filename: string, type: FormationLegalType) => {
    const markdown = getMarkdown(loadFile(filename, type));
    return {
      contentMd: markdown.content,
      ...(markdown.grayMatter as Record<string, string>),
    };
  };

  const introParagraph = (type: FormationLegalType) =>
    getTextFieldContent("form-business-entity-intro.md", type);
  const businessNameCheck = (type: FormationLegalType) => getTextFieldContent("business-name-check.md", type);
  const services = (type: FormationLegalType) => getTextFieldContent(`services.md`, type);
  const officialFormationDocument = (type: FormationLegalType) =>
    getTextFieldContent(`doc-official-formation.md`, type);
  const certificateOfStanding = (type: FormationLegalType) =>
    getTextFieldContent(`doc-certificate-of-standing.md`, type);
  const certifiedCopyOfFormationDocument = (type: FormationLegalType) =>
    getTextFieldContent(`doc-certified-copy-of-formation-document.md`, type);
  const notification = (type: FormationLegalType) => getTextFieldContent(`notification.md`, type);
  const agentNumberOrManual = (type: FormationLegalType) => getTextFieldContent(`registered-agent.md`, type);
  const members = (type: FormationLegalType) => getTextFieldContent(`members.md`, type);
  const signatureHeader = (type: FormationLegalType) => getTextFieldContent(`signatures.md`, type);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldFunctions: Record<keyof FormationDisplayContent, (type: FormationLegalType) => any> = {
    introParagraph,
    businessNameCheck,
    services,
    officialFormationDocument,
    certificateOfStanding,
    certifiedCopyOfFormationDocument,
    notification,
    agentNumberOrManual,
    members,
    signatureHeader,
  };

  return Object.keys(fieldFunctions).reduce((content, name) => {
    try {
      return {
        ...content,
        [name as keyof FormationDisplayContent]:
          fieldFunctions[name as keyof FormationDisplayContent](legalId),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      if (defaultStore && name in defaultStore) {
        return {
          ...content,
          [name as keyof FormationDisplayContent]: defaultStore[name as keyof FormationDisplayContent],
        };
      }
      return content;
    }
  }, {} as FormationDisplayContent);
};

export const loadTasksDisplayContent = (): TasksDisplayContent => {
  const loadFile = (filename: string): string =>
    fs.readFileSync(path.join(displayContentDir, filename), "utf8");

  const defaultFormationDisplayContent = getFormationFields(defaultFormationLegalType);

  const formationDisplayContent = FormationLegalTypes.filter(
    (val) => val != defaultFormationLegalType
  ).reduce((accumulator: FormationDisplayContentMap, legalId: FormationLegalType) => {
    accumulator[legalId] = getFormationFields(legalId, defaultFormationDisplayContent);
    return accumulator;
  }, {} as FormationDisplayContentMap);
  formationDisplayContent[defaultFormationLegalType] = defaultFormationDisplayContent;

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
    formationDisplayContent,
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

type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  imgPath: string;
  color: string;
  shadowColor: string;
  hasCloseButton: boolean;
  weight: number;
};
