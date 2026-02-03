import type { XrayRegistrationEntry } from "@shared/xray";

export const filterByUndefinedDisposalDate = (
  entries: XrayRegistrationEntry[],
): XrayRegistrationEntry[] => {
  return entries.filter((entry: XrayRegistrationEntry) => {
    return entry.disposalDate === undefined;
  });
};
