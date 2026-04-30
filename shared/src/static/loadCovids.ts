import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { CovidItem } from "../types/types";

const covidsDirectory = path.join(process.cwd(), "..", "content", "src", "covids");

export const loadAllCovids = (): CovidItem[] => {
  if (!fs.existsSync(covidsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(covidsDirectory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(covidsDirectory, fileName);
    const { data } = matter(fs.readFileSync(fullPath, "utf8"));
    return data as CovidItem;
  });
};
