/* eslint-disable @typescript-eslint/no-explicit-any */

import { makeSnippet } from "./helpers";
import { ConfigMatch, GroupedConfigMatch, MatchComparitor } from "./typesForSearch";

const collectionInfo = new Map<string, string[]>();
export const searchConfig = (
  object: any,
  matchComparitor: MatchComparitor,
  cmsConfig: any,
): GroupedConfigMatch[] => {
  const configMatches = searchObject(object.default, matchComparitor, [], []).map((it) => {
    const cmsPath = findCmsConfigPath(cmsConfig, it.keyPath);
    return {
      value: makeSnippet(it.value, matchComparitor),
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
  object: any,
  matchComparitor: MatchComparitor,
  matches: JsonMatch[],
  keyPaths: string[],
): JsonMatch[] => {
  if (typeof object === "object" && object !== null && !Array.isArray(object)) {
    for (const key of Object.keys(object)) {
      const value = object[key];
      if (typeof value === "string") {
        if (matchComparitor.term) {
          if (value.toLowerCase().includes(matchComparitor.term)) {
            matches = [
              ...matches,
              {
                value: value,
                keyPath: [...keyPaths, key],
              },
            ];
          }
        } else if (matchComparitor.regex) {
          const regexMatches = [...value.matchAll(matchComparitor.regex)];
          const contextualInfoFileNames = regexMatches.map((match) => match[1]);
          if (contextualInfoFileNames.length > 0) {
            for (const conextualInfoFileName of contextualInfoFileNames) {
              matches = [
                ...matches,
                {
                  value: conextualInfoFileName,
                  keyPath: [...keyPaths, key],
                },
              ];
            }
          }
        }
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        matches = searchObject(value, matchComparitor, matches, [...keyPaths, key]);
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
        collectionInfo.set(foundFile.label, [collection.name, foundFile.name]);
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

export const getCollectionInfo = (): Map<string, string[]> => {
  return collectionInfo;
};
const buildCmsConfigPath = (
  cmsConfigFile: any,
  keyPath: string[],
  cmsLabelPath: string[],
): string[] => {
  if (keyPath.length === 0) {
    return cmsLabelPath;
  }

  const foundField = cmsConfigFile.fields?.find((it: any) => it.name === keyPath[0]);
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
