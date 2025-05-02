import type { XrayRegistrationEntry } from "@shared/xray";

export const filterByRegistrationNumber = (
  entries: XrayRegistrationEntry[],
): XrayRegistrationEntry[] => {
  const entriesRecord: Record<string, XrayRegistrationEntry> = {};

  for (const entry of entries) {
    if (!entriesRecord[entry.registrationNumber]) {
      entriesRecord[entry.registrationNumber] = entry;
    }
  }

  return Object.values(entriesRecord);
};
