export const getDollarValue = (currVal: string | number): string => {
  const value = Number.parseFloat(currVal.toString());
  if (Number.isNaN(value)) return "";

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
};

export const getStringifiedAddress = ({
  addressLine1,
  city,
  state,
  zipcode,
  country,
  addressLine2,
}: {
  addressLine1: string;
  city: string;
  state: string;
  zipcode: string;
  addressLine2?: string;
  country?: string;
}): string => {
  return `${addressLine1}, ${addressLine2 ? `${addressLine2}, ` : ""}${city}, ${state}, ${zipcode}${
    country ? `, ${country}` : ""
  }`;
};
