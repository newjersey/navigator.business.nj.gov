import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { LicenseName } from "@businessnjgovnavigator/shared/license";
import {
  AnytimeActionCategoryMapping,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types/types";

export const convertAnytimeActionTaskMd = (
  anytimeActionTaskMdContents: string,
  filename: string,
  isTest: boolean = false,
): AnytimeActionTask => {
  const matterResult = matter(anytimeActionTaskMdContents);
  const anytimeActionGrayMatter = matterResult.data as AnytimeActionTaskGrayMatter;
  const anytimeActionCategoryMappings = loadAnytimeActionCategoryMappings(isTest);

  const newAnytimeActionCategoriesData = anytimeActionGrayMatter.category.map((categoryId) => {
    const displayName = anytimeActionCategoryMappings[categoryId];
    if (displayName) {
      return { categoryId: categoryId, categoryName: displayName };
    }
    return { categoryId: categoryId, categoryName: categoryId };
  });
  return {
    contentMd: matterResult.content,
    filename,
    ...anytimeActionGrayMatter,
    category: newAnytimeActionCategoriesData,
    type: "task",
  };
};

export const convertAnytimeActionLicenseReinstatementMd = (
  anytimeActionLicenseReinstatementMdContents: string,
  filename: string,
): AnytimeActionLicenseReinstatement => {
  const matterResult = matter(anytimeActionLicenseReinstatementMdContents);
  const anytimeActionGrayMatter = matterResult.data as AnytimeActionLicenseReinsatementGrayMatter;

  const anytimeActionCategoryMappings = loadAnytimeActionCategoryMappings();
  const permermitsAndLicenseReinstatementCategoryInfo = {
    categoryName:
      anytimeActionCategoryMappings["reactivate-my-expired-permit-license-or-registration"],
    categoryId: "reactivate-my-expired-permit-license-or-registration",
  };

  return {
    contentMd: matterResult.content,
    filename,
    ...anytimeActionGrayMatter,
    category: [permermitsAndLicenseReinstatementCategoryInfo],
    type: "license-reinstatement",
  };
};

export const convertAnytimeActionCategoryMd = (
  mdContents: string,
): AnytimeActionCategoryMapping => {
  const matterResult = matter(mdContents);

  return {
    categoryName: matterResult.data["category-name"],
    id: matterResult.data["id"],
  };
};

const anytimeActionsCatgoriesDirectoryApp = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-categories",
);

const anytimeActionsCatgoriesDirectoryTest = path.join(
  process.cwd(),
  "content",
  "src",
  "anytime-action-categories",
);

const getAnytimeActionsCatgoriesDirectory = (isTest: boolean): string => {
  if (isTest) {
    return anytimeActionsCatgoriesDirectoryTest;
  }
  return anytimeActionsCatgoriesDirectoryApp;
};

export const loadAnytimeActionCategoryMappings = (
  isTest: boolean = false,
): AnytimeActionCategoryMapping => {
  const fileNames = fs.readdirSync(getAnytimeActionsCatgoriesDirectory(isTest));

  const categoryArrayMapping = fileNames.map((fileName) => {
    return loadIndividualAnytimeActionCatgory(
      fileName,
      getAnytimeActionsCatgoriesDirectory(isTest),
    );
  });

  let categoryArrayMappingTwo = {};

  for (const element of categoryArrayMapping) {
    categoryArrayMappingTwo = {
      ...categoryArrayMappingTwo,
      [element.id]: element.categoryName,
    };
  }

  return categoryArrayMappingTwo;
};

const loadIndividualAnytimeActionCatgory = (
  fileName: string,
  directory: string,
): AnytimeActionCategoryMapping => {
  const fullPath = path.join(directory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  return convertAnytimeActionCategoryMd(fileContents);
};

type AnytimeActionTaskGrayMatter = {
  name: string;
  category: string[];
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  issuingAgency?: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
  summaryDescriptionMd: string;
};

type AnytimeActionLicenseReinsatementGrayMatter = {
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  issuingAgency: string;
  licenseName: LicenseName;
  summaryDescriptionMd: string;
};
