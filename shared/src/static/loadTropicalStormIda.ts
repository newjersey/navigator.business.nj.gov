import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { TropicalStormIdaItem } from "../types/types";

const directory = path.join(process.cwd(), "..", "content", "src", "tropical-storm-ida");

export const loadAllTropicalStormIda = (): TropicalStormIdaItem[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const fileNames = fs.readdirSync(directory).filter((file) => file.endsWith(".md"));

  return fileNames.map((fileName) => {
    const fullPath = path.join(directory, fileName);
    const { data } = matter(fs.readFileSync(fullPath, "utf8"));
    return data as TropicalStormIdaItem;
  });
};
