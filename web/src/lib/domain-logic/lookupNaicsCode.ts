import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject } from "@/lib/types/types";

export const lookupNaicsCode = (code: string): NaicsCodeObject | undefined => {
  return (NaicsCodes as NaicsCodeObject[]).find((element) => {
    return element?.SixDigitCode?.toString() == code;
  });
};
