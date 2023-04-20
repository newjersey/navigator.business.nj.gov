export const getDollarValue = (currVal: string | number): string => {
  const value = Number.parseFloat(currVal.toString());
  if (Number.isNaN(value)) return "";

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
};
