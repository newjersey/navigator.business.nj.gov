export const isZipCodeIntl = (value: string): boolean => {
  return value.length > 0 && value.length <= 11;
};
