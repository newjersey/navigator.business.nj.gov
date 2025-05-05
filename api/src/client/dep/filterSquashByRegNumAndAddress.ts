import type { XrayRegistrationEntry } from "@shared/xray";

export const filterSquashByRegNumAndAddress = (
  entries: XrayRegistrationEntry[],
  addressLine1: string,
): XrayRegistrationEntry[] => {
  const entriesRecord: Record<string, XrayRegistrationEntry> = {};

  for (const entry of entries) {
    const existingEntry = entriesRecord[entry.registrationNumber];
    if (existingEntry) {
      const squashedEntry: XrayRegistrationEntry = {
        ...entry,
        streetAddress:
          existingEntry.streetAddress === addressLine1
            ? existingEntry.streetAddress
            : entry.streetAddress,
      };
      entriesRecord[entry.registrationNumber] = squashedEntry;
    } else {
      entriesRecord[entry.registrationNumber] = entry;
    }
  }

  return Object.values(entriesRecord);
};
