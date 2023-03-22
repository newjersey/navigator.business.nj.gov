import { maskingCharacter } from "@shared/profileData";

export const maskTaxId = (taxId: string): string => {
  return taxId.length === 12
    ? `${maskingCharacter.repeat(7)}${taxId.slice(7, taxId.length)}`
    : `${maskingCharacter.repeat(5)}${taxId.slice(5, taxId.length)}`;
};
