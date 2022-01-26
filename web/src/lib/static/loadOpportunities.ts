import { PathParams } from "@/lib/static/loadFilings";
import { Opportunity } from "@/lib/types/types";
import { convertOpportunityMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug } from "./helpers";

const opportunityDir = path.join(process.cwd(), "..", "content", "src", "opportunities");

export type OpportunityUrlSlugParam = {
  opportunityUrlSlug: string;
};

export const loadAllOpportunities = (): Opportunity[] => {
  const fileNames = fs.readdirSync(opportunityDir);
  return fileNames.map((fileName) => {
    return loadOpportunityByFileName(fileName);
  });
};

export const loadAllOpportunityUrlSlugs = (): PathParams<OpportunityUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(opportunityDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        opportunityUrlSlug: loadOpportunityByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadOpportunityByUrlSlug = (urlSlug: string): Opportunity => {
  const matchingFileName = getFileNameByUrlSlug(opportunityDir, urlSlug);
  return loadOpportunityByFileName(matchingFileName);
};

export const loadOpportunityByFileName = (fileName: string): Opportunity => {
  const fullPath = path.join(opportunityDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertOpportunityMd(fileContents, fileNameWithoutMd);
};
