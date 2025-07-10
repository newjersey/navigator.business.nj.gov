export type Match = {
  filename: string;
  cmsCollectionName: string;
  displayTitle?: string;
  snippets: string[];
  additionalUsageLocations?: AdditionalUsageLocations;
};

export type AdditionalUsageLocations = {
  taskDependencies?: LinkWithDescription[];
  industries?: LinkWithDescription[];
  addOns?: LinkWithDescription[];
};

export type LinkWithDescription = {
  description: string;
  link: string;
};

export type LabelledContent = {
  content: string | undefined;
  label: string;
};

export type LabelledContentList = {
  content: string[];
  label: string;
};

export type ConfigMatch = {
  cmsLabelPath: string[];
  value: string;
};

export type GroupedConfigMatch = {
  cmsCollectionName: string;
  cmsFileName: string;
  matches: ConfigMatch[];
};
