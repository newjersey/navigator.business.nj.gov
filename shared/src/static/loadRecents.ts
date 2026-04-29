import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { RecentItem } from "../types/types";

const recentsDirectory = path.join(process.cwd(), "..", "content", "src", "recents");

export const loadAllRecents = (): RecentItem[] => {
  if (!fs.existsSync(recentsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(recentsDirectory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(recentsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { ...data, body: content } as RecentItem;
  });
};
