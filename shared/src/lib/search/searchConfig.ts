import type { CmsConfig, CmsConfigField } from "../../types/types";
import { makeSnippet } from "./helpers";
import type { ConfigMatch, GroupedConfigMatch, MatchComparator } from "./typesForSearch";

const collectionInfo = new Map<string, string[]>();
type JsonObject = Readonly<Record<string, unknown>>;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const searchConfig = (
  object: unknown,
  matchComparator: MatchComparator,
  cmsConfig: CmsConfig,
): GroupedConfigMatch[] => {
  const configDefaults = isJsonObject(object) ? object.default : undefined;
  const configMatches = searchObject(configDefaults, matchComparator, [], []).map((it) => {
    const cmsPath = findCmsConfigPath(cmsConfig, it.keyPath);
    return {
      value: makeSnippet(it.value, matchComparator),
      cmsLabelPath: cmsPath,
    };
  });

  return groupByCMSFile(configMatches);
};

const groupByCMSFile = (configMatches: ConfigMatch[]): GroupedConfigMatch[] => {
  const groupedConfigMatches: Record<string, ConfigMatch[]> = {};

  for (const match of configMatches) {
    const groupLabel = match.cmsLabelPath.slice(0, 2).join(" > ");
    const existingGroup = groupedConfigMatches[groupLabel];
    groupedConfigMatches[groupLabel] = existingGroup ? [...existingGroup, match] : [match];
  }

  return Object.keys(groupedConfigMatches).map((key) => ({
    cmsCollectionName: key.split(" > ")[0],
    cmsFileName: key.split(" > ")[1],
    matches: groupedConfigMatches[key],
  }));
};

const searchObject = (
  object: unknown,
  matchComparator: MatchComparator,
  matches: JsonMatch[],
  keyPaths: string[],
): JsonMatch[] => {
  let found = matches;
  if (isJsonObject(object)) {
    for (const key of Object.keys(object)) {
      const value = object[key];
      if (typeof value === "string") {
        if (matchComparator.term) {
          if (value.toLowerCase().includes(matchComparator.term)) {
            found = [
              ...found,
              {
                value: value,
                keyPath: [...keyPaths, key],
              },
            ];
          }
        } else if (matchComparator.regex) {
          const regexMatches = [...value.matchAll(matchComparator.regex)];
          const contextualInfoFileNames = regexMatches.map((match) => match[1]);
          if (contextualInfoFileNames.length > 0) {
            for (const contextualInfoFileName of contextualInfoFileNames) {
              found = [
                ...found,
                {
                  value: contextualInfoFileName,
                  keyPath: [...keyPaths, key],
                },
              ];
            }
          }
        }
      } else if (isJsonObject(value)) {
        found = searchObject(value, matchComparator, found, [...keyPaths, key]);
      }
    }
  }
  return found;
};

const findCmsConfigPath = (cmsConfig: CmsConfig, keyPath: string[]): string[] => {
  const matchingFiles = findFilesInCmsConfig(cmsConfig, keyPath[0]);

  for (const fileMatch of matchingFiles) {
    const { labelPathForCmsConfigFile, cmsConfigFile } = fileMatch;
    const cmsLabelPath = buildCmsConfigPath(cmsConfigFile, keyPath, []);

    if (cmsLabelPath.length === keyPath.length) {
      return [...labelPathForCmsConfigFile, ...cmsLabelPath];
    }
  }

  throw new Error(
    `NO MATCHING CMS PATH FOR ${keyPath.toString()} (possibly missing in the CMS but exists in the JSON files)`,
  );
};

const findFilesInCmsConfig = (cmsConfig: CmsConfig, key: string): FileMatch[] => {
  const matchingFiles: FileMatch[] = [];

  for (const collection of cmsConfig.collections) {
    if (!collection.files) continue;
    const foundFiles = collection.files.filter((fileEntry) => {
      if (!fileEntry.fields) return false;
      return fileEntry.fields.find((field) => field.name === key);
    });
    if (foundFiles.length > 0) {
      for (const foundFile of foundFiles) {
        collectionInfo.set(foundFile.label, [collection.name, foundFile.name]);
        matchingFiles.push({
          labelPathForCmsConfigFile: [collection.label, foundFile.label],
          cmsConfigFile: foundFile,
        });
      }
    }
  }

  if (matchingFiles.length === 0) {
    throw new Error(`DID NOT FIND CMS FILE FOR ${key}`);
  }

  return matchingFiles;
};

export const getCollectionInfo = (): Map<string, string[]> => {
  return collectionInfo;
};
const buildCmsConfigPath = (
  cmsConfigFile: CmsConfigField,
  keyPath: string[],
  cmsLabelPath: string[],
): string[] => {
  if (keyPath.length === 0) {
    return cmsLabelPath;
  }

  const foundField = cmsConfigFile.fields?.find((it) => it.name === keyPath[0]);
  if (!foundField) {
    return cmsLabelPath;
  }
  const newCmsLabelPath = [...cmsLabelPath, foundField.label];
  const remaining = keyPath.slice(1);

  return buildCmsConfigPath(foundField, remaining, newCmsLabelPath);
};

type JsonMatch = {
  value: string;
  keyPath: string[];
};

type FileMatch = {
  labelPathForCmsConfigFile: string[];
  cmsConfigFile: CmsConfigField;
};
