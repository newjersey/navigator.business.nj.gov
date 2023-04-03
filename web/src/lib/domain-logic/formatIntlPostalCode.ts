export const formatIntlPostalCode = (value: string): string => {
  return value
    .slice(0, 11)
    .toUpperCase()
    .replace(/[^\d\sA-Za-z-]/g, "")
    .replaceAll(/\s{2,}/g, " ")
    .replaceAll(/-{2,}/g, "-");
};
