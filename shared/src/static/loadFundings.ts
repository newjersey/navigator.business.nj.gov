import fs from "fs";
import path from "path";
import { Locale } from "../contexts/localeContext";
import { convertFundingMd } from "../markdownReader";
import { Funding } from "../types/types";

const fundingDirectory = path.join(process.cwd(), "..", "content", "src", "fundings");

type PathParameters<P> = { params: P; locale?: string };
export type FundingUrlSlugParameter = {
  fundingUrlSlug: string;
};

const LOCALE_PATTERN = /\.(en|es-LA)\.md$/;

/**
 * Given all filenames in the fundings directory and a locale, returns one file per
 * funding — preferring the locale-specific file (e.g. name.es-LA.md), falling back to
 * the English locale file (name.en.md), then the legacy unlocalized file (name.md).
 */
const getFilesForLocale = (fileNames: string[], locale: Locale): string[] => {
  const filesGroupedByBaseName = new Map<string, string[]>();

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md")) continue;

    const baseName = getBaseFileName(fileName);

    if (!filesGroupedByBaseName.has(baseName)) {
      filesGroupedByBaseName.set(baseName, []);
    }
    filesGroupedByBaseName.get(baseName)!.push(fileName);
  }

  const result: string[] = [];
  for (const [, files] of filesGroupedByBaseName) {
    const localeFile = files.find((f) => f.endsWith(`.${locale}.md`));
    const enFile = files.find((f) => f.endsWith(".en.md"));
    const legacyFile = files.find((f) => !LOCALE_PATTERN.test(f));

    const picked = localeFile || enFile || legacyFile;
    if (picked) result.push(picked);
  }

  return result;
};

/** Strips the locale suffix and .md extension to get the base funding name. */
const getBaseFileName = (fileName: string): string => {
  return fileName.replace(LOCALE_PATTERN, "").replace(/\.md$/, "");
};

export const loadAllFundings = (locale: Locale = "en"): Funding[] => {
  const fileNames = fs.readdirSync(fundingDirectory);
  const localeFiles = getFilesForLocale(fileNames, locale);
  return localeFiles.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

export const loadAllFundingUrlSlugs = (): PathParameters<FundingUrlSlugParameter>[] => {
  const fileNames = fs.readdirSync(fundingDirectory);
  const localeFiles = getFilesForLocale(fileNames, "en");
  return localeFiles.map((fileName) => {
    return {
      params: {
        fundingUrlSlug: loadFundingByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadFundingByUrlSlug = (urlSlug: string, locale: Locale = "en"): Funding => {
  const fileNames = fs.readdirSync(fundingDirectory);
  const localeFiles = getFilesForLocale(fileNames, locale);

  for (const fileName of localeFiles) {
    const funding = loadFundingByFileName(fileName);
    if (funding.urlSlug === urlSlug) {
      return funding;
    }
  }

  throw new Error(`Funding with urlSlug ${urlSlug} not found for locale ${locale}`);
};

export const loadFundingByFileName = (fileName: string): Funding => {
  const fullPath = path.join(fundingDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  return convertFundingMd(fileContents, getBaseFileName(fileName));
};
