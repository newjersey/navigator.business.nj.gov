import fs from "fs";
import path from "path";
import { SubCategoryItem } from "../types/types";

const subCategoriesDirectory = path.join(process.cwd(), "..", "content", "src", "sub-categories");

export const loadAllSubCategories = (): SubCategoryItem[] => {
  if (!fs.existsSync(subCategoriesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(subCategoriesDirectory).filter((file) => file.endsWith(".json"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(subCategoriesDirectory, fileName);
    return JSON.parse(fs.readFileSync(fullPath, "utf8")) as SubCategoryItem;
  });
};
