import fs from "fs";
import path from "path";
import { convertFundingMd } from "@businessnjgovnavigator/shared/markdownReader";
import { Funding } from "@businessnjgovnavigator/shared/types/types";
import { getFileNameByUrlSlug } from "@businessnjgovnavigator/shared/static/helpers";

const fundingDirectory = path.join(process.cwd(), "..", "content", "src", "fundings");

type PathParameters<P> = { params: P; locale?: string };
export type FundingUrlSlugParameter = {
  fundingUrlSlug: string;
};

export const loadAllFundings = (): Funding[] => {
  const fileNames = fs.readdirSync(fundingDirectory);
  return fileNames.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

export const loadAllFundingUrlSlugs = (): PathParameters<FundingUrlSlugParameter>[] => {
  const fileNames = fs.readdirSync(fundingDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        fundingUrlSlug: loadFundingByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadFundingByUrlSlug = (urlSlug: string): Funding => {
  const matchingFileName = getFileNameByUrlSlug(fundingDirectory, urlSlug);
  return loadFundingByFileName(matchingFileName);
};

export const loadFundingByFileName = (fileName: string): Funding => {
  const fullPath = path.join(fundingDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertFundingMd(fileContents, fileNameWithoutMd);
};
