import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { PageItem } from "../types/types";

const pagesDirectory = path.join(process.cwd(), "..", "content", "src", "pages");

export const loadAllPages = (): PageItem[] => {
  if (!fs.existsSync(pagesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(pagesDirectory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(pagesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return data as PageItem;
  });
};
