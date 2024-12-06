import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";

export const isZipCodeNj = (value: string): boolean => {
  if (!isZipCodeUs(value)) return false;
  const parsedValue = Number.parseInt(value);
  return parsedValue >= 7001 && parsedValue <= 8999 && value.length === 5;
};
