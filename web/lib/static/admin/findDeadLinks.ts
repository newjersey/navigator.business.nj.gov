import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { AddOn, TaskModification } from "@/lib/roadmap/roadmapBuilder";

const roadmapsDir = path.join(process.cwd(), "roadmaps");
const displayContentDir = path.join(process.cwd(), "display-content");
const tasksDir = path.join(roadmapsDir, "tasks");
const addOnsDir = path.join(roadmapsDir, "add-ons");
const modificationsDir = path.join(roadmapsDir, "modifications");
const contextualInfoDir = path.join(process.cwd(), "display-content", "contextual-information");

type Filenames = {
  tasks: string[];
  addOns: string[];
  modifications: string[];
  contextualInfos: string[];
  displayContents: string[];
};

type FileContents = {
  tasks: string[];
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
  addOns: fs.readdirSync(addOnsDir),
  modifications: fs.readdirSync(modificationsDir),
  contextualInfos: fs.readdirSync(contextualInfoDir),
  displayContents: getFlattenedFilenames(displayContentDir).filter((it) => it.endsWith(".md")),
});

const getContents = (filenames: Filenames): FileContents => ({
  tasks: filenames.tasks.map(
    (it) => matter(fs.readFileSync(path.join(roadmapsDir, "tasks", it), "utf8")).content
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
