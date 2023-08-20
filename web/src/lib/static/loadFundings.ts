import { PathParams } from "@/lib/static/loadFilings";
import { Funding } from "@/lib/types/types";
import { convertFundingMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug } from "./helpers";

const fundingDir = path.join(process.cwd(), "..", "content", "src", "fundings");

export type FundingUrlSlugParam = {
  fundingUrlSlug: string;
};

export const loadAllFundings = (): Funding[] => {
  const fileNames = fs.readdirSync(fundingDir);
  return fileNames.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

export const loadAllFundingUrlSlugs = (): PathParams<FundingUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(fundingDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        fundingUrlSlug: loadFundingByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadFundingByUrlSlug = (urlSlug: string): Funding => {
  const matchingFileName = getFileNameByUrlSlug(fundingDir, urlSlug);
  return loadFundingByFileName(matchingFileName);
};

export const loadFundingByFileName = (fileName: string): Funding => {
  const fullPath = path.join(fundingDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertFundingMd(fileContents, fileNameWithoutMd);
};
