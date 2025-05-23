import { loadAnytimeActionCategoryMappings } from "@/lib/static/loadAnytimeActionTasks";
import {
  AnytimeActionCategoryMapping,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@/lib/types/types";
import { LicenseName } from "@businessnjgovnavigator/shared/";
import matter from "gray-matter";

export const convertAnytimeActionTaskMd = (
  anytimeActionTaskMdContents: string,
  filename: string,
): AnytimeActionTask => {
  const matterResult = matter(anytimeActionTaskMdContents);
  const anytimeActionGrayMatter = matterResult.data as AnytimeActionTaskGrayMatter;
  const anytimeActionCategoryMappings = loadAnytimeActionCategoryMappings();

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
