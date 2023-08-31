export const extractConfig = <T extends string>(configCollection: Record<T, string>, key: T): string => {
  return configCollection[key];
};
