import { CategoryItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchCategories = (categories: CategoryItem[], term: string): Match[] => {
  const categoryData = getCategoryData(categories);

  return convertFileDataToMatchList(categoryData, term);
};

export const getCategoryData = (categories: CategoryItem[]): FileData[] => {
  const categoryData: FileData[] = [];

  for (const category of categories) {
    const name = category.name.toLowerCase();
    const slug = category.slug.toLowerCase();
    const navName = category["nav-name"]?.toLowerCase();
    const descriptionText = category["description-text"]?.toLowerCase();
    const topicDescription = category["topic-description"]?.toLowerCase();
    const homepageDescription = category["homepage-description"]?.toLowerCase();

    const blockTexts = [descriptionText, topicDescription, homepageDescription].filter(
      (text): text is string => text !== undefined,
    );

    const labelledTexts = [
      { content: name, label: "Name" },
      { content: slug, label: "Slug" },
      { content: navName, label: "Nav Name" },
    ];

    categoryData.push({
      fileName: category.slug,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return categoryData;
};
