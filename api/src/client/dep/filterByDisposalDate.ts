import { XrayRegistrationEntry } from "@shared/xray";

export const filterByDisposalDate = (entries: XrayRegistrationEntry[]): XrayRegistrationEntry[] => {
  return entries.filter((entry: XrayRegistrationEntry) => {
    return entry.disposalDate === undefined;
  });
};
