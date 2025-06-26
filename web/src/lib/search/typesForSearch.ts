export type Match = {
  filename: string;
  cmsCollectionName: string;
  displayTitle?: string;
  snippets: string[];
  additionalUsageLocations?: AdditionalUsageLocations;
};

export type AdditionalUsageLocations = {
  taskDependencies?: string[];
  industries?: string[];
  addOns?: string[];
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
