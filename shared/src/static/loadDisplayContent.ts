import fs from "fs";
import path from "path";
import { getMarkdown } from "../markdownReader";
import {
  FormationDbaContent,
  FormationDbaDisplayContent,
  RoadmapDisplayContent,
  SidebarCardContent,
  TaskWithoutLinks,
} from "../types/types";

const displayContentDirectory = path.join(process.cwd(), "..", "content", "src", "display-content");

export const loadRoadmapSideBarDisplayContent = (): RoadmapDisplayContent => {
  const fileNames = fs.readdirSync(path.join(displayContentDirectory, "roadmap-sidebar-cards"));

  // eslint-disable-next-line unicorn/no-array-reduce
  const sideBarDisplayContent = fileNames.reduce(
    (accumulator, current) => {
      const fileContents: string = fs.readFileSync(
        path.join(displayContentDirectory, "roadmap-sidebar-cards", current),
        "utf8",
      );
      const markdownContents = getMarkdown(fileContents);
      const displayContent: SidebarCardContent = {
        contentMd: markdownContents.content,
        ...(markdownContents.grayMatter as RoadmapCardGrayMatter),
      };
      return { ...accumulator, [displayContent.id]: displayContent };
    },
    {} as Record<string, SidebarCardContent>,
  );

  return {
    sidebarDisplayContent: sideBarDisplayContent,
  };
};

const getPath = (filename: string): string => {
  return path.join(displayContentDirectory, "business-formation", "nexus", filename);
};

const loadFile = (filename: string): string => {
  return fs.readFileSync(getPath(filename), "utf8");
};

const getTask = (filename: string): TaskWithoutLinks => {
  const markdown = getMarkdown(loadFile(filename));
  return {
    contentMd: markdown.content,
    ...(markdown.grayMatter as Record<string, string>),
  } as TaskWithoutLinks;
};

const getDbaTasks = (): FormationDbaContent => {
  return {
    DbaResolution: getTask("dba-resolution-foreign.md"),
    Authorize: getTask("authorize-business-entity.md"),
    Formation: getTask("form-business-entity.md"),
  };
};

export const loadFormationDbaContent = (): FormationDbaDisplayContent => {
  return {
    formationDbaContent: getDbaTasks(),
  };
};

type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  notStartedHeader: string;
  completedHeader: string;
  ctaText: string;
  hasCloseButton: boolean;
  preBodySpanButtonText: string;
};
