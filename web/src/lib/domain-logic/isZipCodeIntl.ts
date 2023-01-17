export const isZipCodeIntl = (value: string): boolean => {
  const parsedValue = Number.parseInt(value);
  if (Number.isNaN(parsedValue) || /\D/.test(value)) return false;
  return parsedValue >= 0 && value.length >= 5 && value.length <= 11;
};
