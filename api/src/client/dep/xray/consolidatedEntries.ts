import type { XrayRegistrationEntry } from "@shared/xray";

export const consolidatedEntries = (
  addressResults: XrayRegistrationEntry[],
  businessNameResults: XrayRegistrationEntry[],
): XrayRegistrationEntry[] => {
  const businessNameRecord: Record<string, XrayRegistrationEntry> = {};
  const consolidatedEntries: XrayRegistrationEntry[] = [];

  for (const entry of businessNameResults) {
    if (!businessNameRecord[entry.registrationNumber]) {
      businessNameRecord[entry.registrationNumber] = entry;
    }
  }

  for (const entry of addressResults) {
    const currentBusinessNameRecord = businessNameRecord[entry.registrationNumber];
    if (
      currentBusinessNameRecord &&
      currentBusinessNameRecord.businessName === entry.businessName &&
      currentBusinessNameRecord.streetAddress === entry.streetAddress &&
      currentBusinessNameRecord.zipCode === entry.zipCode
    ) {
      consolidatedEntries.push(currentBusinessNameRecord);
    }
  }

  return consolidatedEntries;
};
