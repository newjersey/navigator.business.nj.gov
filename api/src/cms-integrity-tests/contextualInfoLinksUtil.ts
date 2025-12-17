import { loadAllContextualInfo } from "@shared/static";

export const conextualLinkRegexGlobal = /[^`|]*`[^|]+\|([^`]+)`/g;
export const allContextualInfoFileNames = (): Set<string> =>
  new Set(loadAllContextualInfo().map((element) => element.filename.toLowerCase()));
