export const isZipCodeUs = (value: string): boolean => {
  const parsedValue = Number.parseInt(value);
  if (Number.isNaN(parsedValue)) return false;
  return parsedValue >= 501 && parsedValue <= 99950 && value.length === 5;
};
