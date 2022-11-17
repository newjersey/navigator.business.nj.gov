import {
  FormationDisplayContent,
  FormationDisplayContentMap,
  RoadmapDisplayContent,
  SidebarCardContent,
  TasksDisplayContent,
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import {
  allFormationLegalTypes,
  defaultFormationLegalType,
  FormationLegalType,
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

const getFormationFields = (
  legalId: FormationLegalType,
  defaultStore?: FormationDisplayContent
): FormationDisplayContent => {
  const getPath = (filename: string, type?: FormationLegalType): string => {
    return path.join(displayContentDir, "business-formation", type ?? "", filename);
  };

  const loadFile = (filename: string, type?: FormationLegalType): string => {
    return fs.readFileSync(getPath(filename, type), "utf8");
  };

  const getTextFieldContent = (filename: string, type: FormationLegalType) => {
    const markdown = getMarkdown(loadFile(filename, type));
    return {
      contentMd: markdown.content,
      ...(markdown.grayMatter as Record<string, string>),
    };
  };

  const introParagraph = (type: FormationLegalType) => {
    return getTextFieldContent("form-business-entity-intro.md", type);
  };
  const businessNameCheck = (type: FormationLegalType) => {
    return getTextFieldContent("business-name-check.md", type);
  };
  const services = (type: FormationLegalType) => {
    return getTextFieldContent(`services.md`, type);
  };
  const officialFormationDocument = (type: FormationLegalType) => {
    return getTextFieldContent(`doc-official-formation.md`, type);
  };
  const certificateOfStanding = (type: FormationLegalType) => {
    return getTextFieldContent(`doc-certificate-of-standing.md`, type);
  };
  const certifiedCopyOfFormationDocument = (type: FormationLegalType) => {
    return getTextFieldContent(`doc-certified-copy-of-formation-document.md`, type);
  };
  const notification = (type: FormationLegalType) => {
    return getTextFieldContent(`notification.md`, type);
  };
  const agentNumberOrManual = (type: FormationLegalType) => {
    return getTextFieldContent(`registered-agent.md`, type);
  };
  const members = (type: FormationLegalType) => {
    return getTextFieldContent(`members.md`, type);
  };
  const signatureHeader = (type: FormationLegalType) => {
    return getTextFieldContent(`signatures.md`, type);
  };

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
  const defaultFormationDisplayContent = getFormationFields(defaultFormationLegalType);

  const formationDisplayContent = allFormationLegalTypes
    .filter((val) => {
      return val != defaultFormationLegalType;
    })
    .reduce((accumulator: FormationDisplayContentMap, legalId: FormationLegalType) => {
      accumulator[legalId] = getFormationFields(legalId, defaultFormationDisplayContent);
      return accumulator;
    }, {} as FormationDisplayContentMap);
  formationDisplayContent[defaultFormationLegalType] = defaultFormationDisplayContent;

  return {
    formationDisplayContent,
  };
};

type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  notStartedHeader: string;
  completedHeader: string;
  imgPath: string;
  color: string;
  ctaText: string;
  headerBackgroundColor: string;
  borderColor: string;
  hasCloseButton: boolean;
  weight: number;
};
