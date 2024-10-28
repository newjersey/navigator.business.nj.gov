/* eslint-disable @typescript-eslint/no-explicit-any */

import { makeSnippet } from "@/lib/search/helpers";
import { ConfigMatch, GroupedConfigMatch } from "@/lib/search/typesForSearch";

export const searchConfig = (obj: any, term: string, cmsConfig: any): GroupedConfigMatch[] => {
  const configMatches = searchObj(obj.default, term, [], []).map((it) => {
    const cmsPath = findCmsConfigPath(cmsConfig, it.keyPath);
    return {
      value: makeSnippet(it.value, term),
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
    if (existingGroup) {
      groupedConfigMatches[groupLabel] = [...existingGroup, match];
    } else {
      groupedConfigMatches[groupLabel] = [match];
    }
  }

  return Object.keys(groupedConfigMatches).map((key) => ({
    cmsCollectionName: key.split(" > ")[0],
    cmsFileName: key.split(" > ")[1],
    matches: groupedConfigMatches[key],
  }));
};

const searchObj = (obj: any, term: string, matches: JsonMatch[], keyPaths: string[]): JsonMatch[] => {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "string") {
        if (value.toLowerCase().includes(term)) {
          matches = [
            ...matches,
            {
              value: value,
              keyPath: [...keyPaths, key],
            },
          ];
        }
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        matches = searchObj(value, term, matches, [...keyPaths, key]);
      }
    }

    return matches;
  } else {
    return matches;
  }
};

const findCmsConfigPath = (cmsConfig: any, keyPath: string[]): string[] => {
  const matchingFiles = findFilesInCmsConfig(cmsConfig, keyPath[0]);

  for (const fileMatch of matchingFiles) {
    const { labelPathForCmsConfigFile, cmsConfigFile } = fileMatch;
    const cmsLabelPath = buildCmsConfigPath(cmsConfigFile, keyPath, []);

    if (cmsLabelPath.length === keyPath.length) {
      return [...labelPathForCmsConfigFile, ...cmsLabelPath];
    }
  }

  throw `NO MATCHING CMS PATH FOR ${keyPath.toString()} (possibly missing in the CMS but exists in the JSON files)`;
};

const findFilesInCmsConfig = (cmsConfig: any, key: string): FileMatch[] => {
  const matchingFiles: FileMatch[] = [];

  for (const collection of cmsConfig.collections) {
    if (!collection.files) continue;
    const foundFiles = collection.files.filter((fileEntry: any) => {
      if (!fileEntry.fields) return false;
      return fileEntry.fields.find((field: any) => field.name === key);
    });
    if (foundFiles.length > 0) {
      for (const foundFile of foundFiles) {
        matchingFiles.push({
          labelPathForCmsConfigFile: [collection.label, foundFile.label],
          cmsConfigFile: foundFile,
        });
      }
    }
  }

  if (matchingFiles.length === 0) {
    throw `DID NOT FIND CMS FILE FOR ${key}`;
  }

  return matchingFiles;
};

const buildCmsConfigPath = (cmsConfigFile: any, keyPath: string[], cmsLabelPath: string[]): string[] => {
  if (keyPath.length === 0) {
    return cmsLabelPath;
  }

  const foundField = cmsConfigFile.fields.find((it: any) => it.name === keyPath[0]);
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
  cmsConfigFile: any;
};
