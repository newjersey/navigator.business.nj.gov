/* eslint-disable @typescript-eslint/no-explicit-any */

import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { AddOn, IndustryRoadmap, TaskModification } from "@/lib/roadmap/roadmapBuilder";
import { HtmlUrlChecker } from "broken-link-checker";

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");
const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");
const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");
const tasksDir = path.join(roadmapsDir, "tasks");
const industriesDir = path.join(roadmapsDir, "industries");
const addOnsDir = path.join(roadmapsDir, "add-ons");
const modificationsDir = path.join(roadmapsDir, "modifications");
const contextualInfoDir = path.join(displayContentDir, "contextual-information");

type Filenames = {
  tasks: string[];
  industries: string[];
  filings: string[];
  addOns: string[];
  modifications: string[];
  contextualInfos: string[];
  displayContents: string[];
};

type FileContents = {
  tasks: string[];
  industries: Array<IndustryRoadmap>;
  addOns: Array<AddOn[]>;
  modifications: Array<TaskModification[]>;
  contextualInfos: string[];
  displayContents: string[];
};

const getFlattenedFilenames = (dir: string): string[] => {
  const allItems = fs.readdirSync(dir);
  let paths: string[] = [];
  for (const item of allItems) {
    const components = item.split(".");
    const isDirectory = components.length === 1;
    if (isDirectory) {
      paths = [...paths, ...getFlattenedFilenames(path.join(dir, components[0]))];
    } else {
      paths.push(path.join(dir, item));
    }
  }
  return paths;
};

const getFilenames = (): Filenames => ({
  tasks: fs.readdirSync(tasksDir),
  industries: fs.readdirSync(industriesDir),
  filings: fs.readdirSync(filingsDir),
  addOns: fs.readdirSync(addOnsDir),
  modifications: fs.readdirSync(modificationsDir),
  contextualInfos: fs.readdirSync(contextualInfoDir),
  displayContents: getFlattenedFilenames(displayContentDir).filter((it) => it.endsWith(".md")),
});

const getContents = (filenames: Filenames): FileContents => ({
  tasks: filenames.tasks.map(
    (it) => matter(fs.readFileSync(path.join(roadmapsDir, "tasks", it), "utf8")).content
  ),
  industries: filenames.industries.map(
    (it) => JSON.parse(fs.readFileSync(path.join(roadmapsDir, "industries", it), "utf8")) as IndustryRoadmap
  ),
  addOns: filenames.addOns.map(
    (it) => JSON.parse(fs.readFileSync(path.join(roadmapsDir, "add-ons", it), "utf8")) as AddOn[]
  ),
  modifications: filenames.modifications.map(
    (it) =>
      JSON.parse(fs.readFileSync(path.join(roadmapsDir, "modifications", it), "utf8")) as TaskModification[]
  ),
  contextualInfos: filenames.contextualInfos.map(
    (it) =>
      matter(fs.readFileSync(path.join(displayContentDir, "contextual-information", it), "utf8")).content
  ),
  displayContents: filenames.displayContents.map((it) => matter(fs.readFileSync(it, "utf8")).content),
});

const isReferencedInAMarkdown = async (
  contextualInfoFilename: string,
  markdowns: string[]
): Promise<boolean> => {
  let contained = false;
  const contextualInfoId = contextualInfoFilename.split(".md")[0];
  for (const content of markdowns) {
    const regexStr = `\`.*\\|${contextualInfoId}\``;
    if (new RegExp(regexStr).test(content)) {
      contained = true;
      break;
    }
  }
  return contained;
};

const isReferencedInARoadmap = async (filename: string, contents: FileContents): Promise<boolean> => {
  let containedInAnAddOn = false;
  let containedInAModification = false;
  const filenameWithoutMd = filename.split(".md")[0];

  for (const industry of contents.industries) {
    if (industry.roadmapSteps.some((it) => it.task === filenameWithoutMd)) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const industry of contents.industries) {
    if (industry.modifications.some((it) => it.replaceWithFilename === filenameWithoutMd)) {
      containedInAModification = true;
      break;
    }
  }

  for (const addOn of contents.addOns) {
    if (addOn.some((it) => it.task === filenameWithoutMd)) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const modification of contents.modifications) {
    if (modification.some((it) => it.replaceWithFilename === filenameWithoutMd)) {
      containedInAModification = true;
      break;
    }
  }

  return containedInAModification || containedInAnAddOn;
};

export const findDeadTasks = async (): Promise<string[]> => {
  const deadTasks = [];
  const filenames = getFilenames();
  const contents = getContents(filenames);
  for (const filename of filenames.tasks) {
    if (!(await isReferencedInARoadmap(filename, contents))) {
      deadTasks.push(filename);
    }
  }
  return deadTasks;
};

export const findDeadLinks = async (): Promise<Record<string, string[]>> => {
  const filenames = getFilenames();
  const pages = [
    "/onboarding?page=1",
    "/onboarding?page=2",
    "/onboarding?page=3",
    "/onboarding?page=4",
    "/profile",
    "/roadmap",
    ...filenames.tasks.map((it) => `/tasks/${it.split(".md")[0]}`),
    ...filenames.filings.map((it) => `/filings/${it.split(".md")[0]}`),
  ];

  const deadLinks = pages.reduce((acc, cur) => {
    acc[cur] = [];
    return acc;
  }, {} as Record<string, string[]>);

  const pagePromises = [];

  const templateEvals = [
    "municipalityWebsite",
    "municipality",
    "county",
    "countyClerkPhone",
    "countyClerkWebsite",
  ];

  const isTemplateLink = (url: string): boolean => {
    return url.startsWith("$") && templateEvals.some((it) => url.includes(it));
  };

  for (const page of pages) {
    const promise = new Promise((resolve) => {
      const htmlUrlChecker = new HtmlUrlChecker(
        {},
        {
          link: (result: any) => {
            if (result.broken && !isTemplateLink(result.url.original)) {
              deadLinks[page].push(result.url.original);
            }
          },
          end: () => {
            resolve({});
          },
        }
      );
      const url = new URL(process.env.REDIRECT_URL || "");
      htmlUrlChecker.enqueue(`${url.origin}${page}`, {});
    });

    pagePromises.push(promise);
  }

  await Promise.all(pagePromises);
  return deadLinks;
};

export const findDeadContextualInfo = async (): Promise<string[]> => {
  const deadContextualInfos = [];
  const filenames = getFilenames();
  const contents = getContents(filenames);
  for (const contextualInfo of filenames.contextualInfos) {
    if (
      !(
        (await isReferencedInAMarkdown(contextualInfo, contents.tasks)) ||
        (await isReferencedInAMarkdown(contextualInfo, contents.displayContents)) ||
        (await isReferencedInAMarkdown(contextualInfo, contents.contextualInfos))
      )
    ) {
      deadContextualInfos.push(contextualInfo);
    }
  }
  return deadContextualInfos;
};
