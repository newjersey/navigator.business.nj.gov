import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { CategoryItem } from "../types/types";

const categoriesDirectory = path.join(process.cwd(), "..", "content", "src", "categories");

export const loadAllCategories = (): CategoryItem[] => {
  if (!fs.existsSync(categoriesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(categoriesDirectory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(categoriesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return data as CategoryItem;
  });
};
