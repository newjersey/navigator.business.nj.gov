import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import type { CmsConfig } from "../types/types";

const configPath = path.join(process.cwd(), "public", "mgmt", "config.yml");
const configPathTest = path.join(process.cwd(), "..", "web", "public", "mgmt", "config.yml");

const hasCollectionsList = (value: unknown): value is CmsConfig =>
  typeof value === "object" &&
  value !== null &&
  "collections" in value &&
  Array.isArray(value.collections);

export const parseCmsConfig = (yamlText: string): CmsConfig => {
  const parsed: unknown = yaml.load(yamlText);
  if (!hasCollectionsList(parsed)) {
    throw new Error("CMS config has no collections list");
  }
  return parsed;
};

export const loadCmsConfig = (isTest: boolean = false): CmsConfig => {
  let loadPath = configPath;
  if (isTest) {
    loadPath = configPathTest;
  }
  return parseCmsConfig(fs.readFileSync(loadPath, "utf8"));
};
