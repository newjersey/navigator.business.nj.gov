import fs from "fs";
import path from "path";
import { CategoryItem } from "../types/types";

const categoriesDirectory = path.join(process.cwd(), "..", "content", "src", "categories");

export const loadAllCategories = (): CategoryItem[] => {
  if (!fs.existsSync(categoriesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(categoriesDirectory).filter((file) => file.endsWith(".json"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(categoriesDirectory, fileName);
    return JSON.parse(fs.readFileSync(fullPath, "utf8")) as CategoryItem;
  });
};
