import type { NaicsCodeObject } from "@businessnjgovnavigator/shared/types";
import NaicsCodes from "@/lib/static/records/naics2022.json";

export const lookupNaicsCode = (code: string): NaicsCodeObject | undefined => {
  return (NaicsCodes as NaicsCodeObject[]).find((element) => {
    return element?.SixDigitCode?.toString() === code;
  });
};
