/* eslint-disable @typescript-eslint/no-explicit-any */

import { AddOn, IndustryRoadmap, TaskModification } from "@/lib/roadmap/roadmapBuilder";
import { HtmlUrlChecker } from "broken-link-checker";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const isNotTestEnv = process.env.NODE_ENV !== "test";

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");
const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");
const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");
const tasksDir = path.join(roadmapsDir, "tasks");
const licenseTasksDir = path.join(roadmapsDir, "license-tasks");
const industriesDir = path.join(roadmapsDir, "industries");
const addOnsDir = path.join(roadmapsDir, "add-ons");
const contextualInfoDir = path.join(displayContentDir, "contextual-information");
const fieldConfigDir = path.join(process.cwd(), "..", "content", "src", "fieldConfig");
const fundingsDir = path.join(process.cwd(), "..", "content", "src", "fundings");
const certificationsDir = path.join(process.cwd(), "..", "content", "src", "certifications");
const licensesDir = path.join(process.cwd(), "..", "content", "src", "license-calendar-events");
const anytimeActionLinksDir = path.join(process.cwd(), "..", "content", "src", "anytime-action-links");
const anytimeActionTasksAdminDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-admin"
);
const anytimeActionTasksLicensesDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-licenses"
);
const anytimeActionTasksReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-reinstatements"
);
const anytimeActionLicenseReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-license-reinstatements"
);

type Filenames = {
  tasks: string[];
  industries: string[];
  filings: string[];
  addOns: string[];
  contextualInfos: string[];
  displayContents: string[];
  fieldConfigs: string[];
  fundings: string[];
  certifications: string[];
  licenses: string[];
  licenseTasks: string[];
  anytimeActionLinks: string[];
  anytimeActionTasksAdmin: string[];
  anytimeActionTasksLicenses: string[];
  anytimeActionTasksReinstatements: string[];
  anytimeActionLicenseReinstatements: string[];
};

type FileContents = {
  tasks: string[];
  industries: Array<IndustryRoadmap>;
  addOns: Array<AddOn[]>;
  modifications: Array<TaskModification[]>;
  contextualInfos: string[];
  displayContents: string[];
  fieldConfigs: string[];
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

const getFilenames = (): Filenames => {
  return {
    tasks: fs.readdirSync(tasksDir),
    industries: fs.readdirSync(industriesDir),
    filings: fs.readdirSync(filingsDir),
    addOns: fs.readdirSync(addOnsDir),
    contextualInfos: fs.readdirSync(contextualInfoDir),
    displayContents: getFlattenedFilenames(displayContentDir).filter((it) => {
      return it.endsWith(".md");
    }),
    fieldConfigs: fs.readdirSync(fieldConfigDir),
    fundings: fs.readdirSync(fundingsDir),
    certifications: fs.readdirSync(certificationsDir),
    licenses: fs.readdirSync(licensesDir),
    licenseTasks: fs.readdirSync(licenseTasksDir),
    anytimeActionLinks: fs.readdirSync(anytimeActionLinksDir),
    anytimeActionTasksAdmin: fs.readdirSync(anytimeActionTasksAdminDir),
    anytimeActionTasksLicenses: fs.readdirSync(anytimeActionTasksLicensesDir),
    anytimeActionTasksReinstatements: fs.readdirSync(anytimeActionTasksReinstatementsDir),
    anytimeActionLicenseReinstatements: fs.readdirSync(anytimeActionLicenseReinstatementsDir),
  };
};

const getContents = (filenames: Filenames): FileContents => {
  const industries = filenames.industries.map((it) => {
    return JSON.parse(fs.readFileSync(path.join(roadmapsDir, "industries", it), "utf8")) as IndustryRoadmap;
  });
  const addOns = filenames.addOns.map((it) => {
    return JSON.parse(fs.readFileSync(path.join(roadmapsDir, "add-ons", it), "utf8")) as IndustryRoadmap;
  });
  const fieldConfigs = filenames.fieldConfigs.map((it) => {
    return fs.readFileSync(path.join(fieldConfigDir, it), "utf8");
  });

  return {
    tasks: filenames.tasks.map((it) => {
      return matter(fs.readFileSync(path.join(roadmapsDir, "tasks", it), "utf8")).content;
    }),
    industries,
    addOns: addOns.map((i) => {
      return i.roadmapSteps;
    }),
    modifications: [
      ...industries.map((i) => {
        return i.modifications;
      }),
      ...addOns.map((i) => {
        return i.modifications;
      }),
    ],
    contextualInfos: filenames.contextualInfos.map((it) => {
      return matter(fs.readFileSync(path.join(displayContentDir, "contextual-information", it), "utf8"))
        .content;
    }),
    displayContents: filenames.displayContents.map((it) => {
      return matter(fs.readFileSync(it, "utf8")).content;
    }),
    fieldConfigs,
  };
};

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

const isReferencedInConfig = async (contextualInfoFilename: string, configs: string[]): Promise<boolean> => {
  let contained = false;
  const contextualInfoId = contextualInfoFilename.split(".md")[0];
  for (const content of configs) {
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
    if (
      industry.roadmapSteps.some((it) => {
        return it.task === filenameWithoutMd;
      })
    ) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const industry of contents.industries) {
    if (
      industry.modifications &&
      industry.modifications.some((it) => {
        return it.replaceWithFilename === filenameWithoutMd;
      })
    ) {
      containedInAModification = true;
      break;
    }
  }

  for (const addOn of contents.addOns) {
    if (
      addOn.some((it) => {
        return it.task === filenameWithoutMd;
      })
    ) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const modification of contents.modifications) {
    if (
      modification &&
      modification.some((it) => {
        return it.replaceWithFilename === filenameWithoutMd;
      })
    ) {
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
    "/profile",
    "/dashboard",
    ...filenames.tasks.map((it) => {
      return `/tasks/${it.split(".md")[0]}`;
    }),
    ...filenames.filings.map((it) => {
      return `/filings/${it.split(".md")[0]}`;
    }),
    "/welcome",
    "/unsupported",
    ...filenames.licenseTasks.map((it) => {
      return `/tasks/${it.split(".md")[0]}`;
    }),

    ...filenames.licenses.map((it) => {
      return `/license-calendar-event/${it.split(".md")[0]}-renewal`;
    }),
    ...filenames.licenses.map((it) => {
      return `/license-calendar-event/${it.split(".md")[0]}-expiration`;
    }),
    ...filenames.fundings.map((it) => {
      return `/funding/${it.split(".md")[0]}`;
    }),
    ...filenames.certifications.map((it) => {
      return `/certification/${it.split(".md")[0]}`;
    }),
    ...filenames.anytimeActionLinks.map((it) => {
      return `/anytime-action-links/${it.split(".md")[0]}`;
    }),
    ...filenames.anytimeActionTasksAdmin.map((it) => {
      return `/anytime-action-tasks-admin/${it.split(".md")[0]}`;
    }),
    ...filenames.anytimeActionTasksLicenses.map((it) => {
      return `/anytime-action-tasks-licenses/${it.split(".md")[0]}`;
    }),
    ...filenames.anytimeActionTasksReinstatements.map((it) => {
      return `/anytime-action-tasks-reinstatements/${it.split(".md")[0]}`;
    }),
    ...filenames.anytimeActionLicenseReinstatements.map((it) => {
      return `/anytime-action-license-reinstatements/${it.split(".md")[0]}`;
    }),
  ];

  const deadLinks = pages.reduce((acc, cur) => {
    acc[cur] = [];
    return acc;
  }, {} as Record<string, string[]>);

  const templateEvals = [
    "municipalityWebsite",
    "municipality",
    "county",
    "countyClerkPhone",
    "countyClerkWebsite",
  ];

  const isTemplateLink = (url: string): boolean => {
    return (
      url.startsWith("$") &&
      templateEvals.some((it) => {
        return url.includes(it);
      })
    );
  };

  const numberOfBatches = Math.ceil(pages.length / 5);

  for (let j = 0; j < numberOfBatches; j++) {
    const pagePromises = [];
    const startIndex = j * 5;
    const batch = pages.slice(startIndex, startIndex + 5);

    isNotTestEnv && console.debug("batch:", batch);

    for (const page of batch) {
      const promise = new Promise((resolve) => {
        const htmlUrlChecker = new HtmlUrlChecker(
          {},
          {
            link: (result: any): void => {
              if (
                result.broken &&
                !isTemplateLink(result.url.original) &&
                result.url.original !== "https://www.facebook.com/BusinessNJgov"
              ) {
                deadLinks[page].push(result.url.original);
              }
            },
            end: (): void => {
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
  }

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
        (await isReferencedInAMarkdown(contextualInfo, contents.contextualInfos)) ||
        (await isReferencedInConfig(contextualInfo, contents.fieldConfigs))
      )
    ) {
      deadContextualInfos.push(contextualInfo);
    }
  }
  return deadContextualInfos;
};
