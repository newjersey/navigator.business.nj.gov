export const isZipCodeNj = (value: string): boolean => {
  const parsedValue = Number.parseInt(value);
  if (value.length !== 5) return false;
  if (Number.isNaN(parsedValue)) return false;
  return parsedValue >= 7001 && parsedValue <= 8999;
};
