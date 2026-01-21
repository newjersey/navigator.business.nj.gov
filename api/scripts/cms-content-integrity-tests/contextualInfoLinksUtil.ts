import { loadAllContextualInfo } from "@businessnjgovnavigator/shared/src/static";

export const conextualLinkRegexGlobal = /[^`|]*`[^|]+\|([^`]+)`/g;
export const allContextualInfoFileNames = (): Set<string> =>
  new Set(loadAllContextualInfo().map((element) => element.filename.toLowerCase()));
