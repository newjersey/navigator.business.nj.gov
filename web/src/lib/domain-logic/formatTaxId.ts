export const formatTaxId = (taxId: string): string => {
  const length = taxId.length;
  if (length === 0) {
    return taxId;
  }
  if (length < 4) {
    return `${taxId}`;
  }
  if (length < 7) {
    return `${taxId.slice(0, 3)}-${taxId.slice(3)}`;
  }
  if (length < 10) {
    return `${taxId.slice(0, 3)}-${taxId.slice(3, 6)}-${taxId.slice(6)}`;
  }
  return `${taxId.slice(0, 3)}-${taxId.slice(3, 6)}-${taxId.slice(6, 9)}/${taxId.slice(9)}`;
};
