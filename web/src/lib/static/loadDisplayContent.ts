import {
  FormationDbaContent,
  RoadmapDisplayContent,
  SidebarCardContent,
  TasksDisplayContent,
  TaskWithoutLinks
} from "@/lib/types/types";
import { getMarkdown } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");

export const loadRoadmapSideBarDisplayContent = (): RoadmapDisplayContent => {
  const fileNames = fs.readdirSync(path.join(displayContentDir, "roadmap-sidebar-cards"));

  const sideBarDisplayContent = fileNames.reduce(
    (acc, cur) => {
      const fileContents: string = fs.readFileSync(
        path.join(displayContentDir, "roadmap-sidebar-cards", cur),
        "utf8"
      );
      const markdownContents = getMarkdown(fileContents);
      const displayContent: SidebarCardContent = {
        contentMd: markdownContents.content,
        ...(markdownContents.grayMatter as RoadmapCardGrayMatter)
      };
      return { ...acc, [displayContent.id]: displayContent };
    },
    {} as Record<string, SidebarCardContent>
  );

  return {
    sidebarDisplayContent: sideBarDisplayContent
  };
};

const getDbaTasks = (): FormationDbaContent => {
  const getPath = (filename: string): string => {
    return path.join(displayContentDir, "business-formation", "nexus", filename);
  };

  const loadFile = (filename: string): string => {
    return fs.readFileSync(getPath(filename), "utf8");
  };

  const getTask = (filename: string): TaskWithoutLinks => {
    const markdown = getMarkdown(loadFile(filename));
    return {
      contentMd: markdown.content,
      ...(markdown.grayMatter as Record<string, string>)
    } as TaskWithoutLinks;
  };

  return {
    DbaResolution: getTask("dba-resolution-foreign.md"),
    Authorize: getTask("authorize-business-entity.md"),
    Formation: getTask("form-business-entity.md")
  };
};

export const loadTasksDisplayContent = (): TasksDisplayContent => {
  return {
    formationDbaContent: getDbaTasks()
  };
};

type RoadmapCardGrayMatter = {
  id: string;
  header: string;
  notStartedHeader: string;
  completedHeader: string;
  imgPath: string | null;
  color: string;
  ctaText: string;
  headerBackgroundColor: string | null;
  borderColor: string;
  hasCloseButton: boolean;
  weight: number;
  section: "above-opportunities" | "below-opportunities";
};
