/* eslint-disable unicorn/filename-case */
import { BrowserStorageFactory } from "@/lib/storage/BrowserStorage";

interface AccountLinkingErrorStorage {
  getEncounteredMyNjLinkingError: () => boolean | undefined;
  setEncounteredMyNjLinkingError: (value: boolean) => void;
}

const myNjLinkingErrorPrefix = "$navigatorAccountLinkingError$";

export const AccountLinkingErrorStorageFactory = (): AccountLinkingErrorStorage => {
  const browserStorage = BrowserStorageFactory("local");

  const getEncounteredMyNjLinkingError = (): boolean | undefined => {
    const data = browserStorage.get(myNjLinkingErrorPrefix);
    if (!data || (data !== "true" && data !== "false")) {
      return undefined;
    }
    return JSON.parse(data);
  };

  const setEncounteredMyNjLinkingError = (value: boolean): void => {
    const stringToSave = value ? "true" : "false";
    browserStorage.set(myNjLinkingErrorPrefix, stringToSave);
  };

  return {
    getEncounteredMyNjLinkingError,
    setEncounteredMyNjLinkingError,
  };
};
