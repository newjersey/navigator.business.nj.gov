import type { XrayRegistrationEntry } from "@shared/xray";

export const filterByOwnerType = (entries: XrayRegistrationEntry[]): XrayRegistrationEntry[] => {
  return entries.filter((entry: XrayRegistrationEntry) => {
    return entry.contactType === "OWNER";
  });
};
