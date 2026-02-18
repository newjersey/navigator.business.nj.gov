import { BrowserStorageFactory } from "@/lib/storage/BrowserStorage";
import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared/";

interface UserDataStorage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (key?: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (key: string, value: any) => any;
  delete: (key?: string) => void;
  clear: () => void;
  keys: () => IterableIterator<string>;
  getCurrentUserData: () => UserData | undefined;
  deleteCurrentUser: () => void;
  getCurrentUserId: () => string | undefined;
  setRegistrationStatus: (value: RegistrationStatus | undefined) => void;
  getRegistrationStatus: () => RegistrationStatus | undefined;
}

export const userDataPrefix = "$swrUserData$";
const registrationStatusKey = "selfRegStatus";
export const swrPrefixToIgnore = "$swr$";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const UserDataStorageFactory = (_cache?: any): UserDataStorage => {
  const buffer = new Map<string, UserData | undefined>();
  const browserStorage = BrowserStorageFactory("session");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get = (key?: string): any => {
    if (!key) {
      return undefined;
    }
    const bufferData = buffer.get(key);
    if (bufferData) {
      return bufferData;
    }
    const data = browserStorage.get(`${prefix(key)}${key}`);
    if (data) {
      const userObject = JSON.parse(data);
      buffer.set(key, userObject);
      return userObject;
    }
    return undefined;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, value: any): any => {
    if (!key) {
      return false;
    }
    buffer.set(key, value);
    return browserStorage.set(`${prefix(key)}${key}`, JSON.stringify(value));
  };

  const _delete = (key?: string): void => {
    if (!key) {
      return undefined;
    }
    buffer.delete(key);
    browserStorage.delete(`${prefix(key)}${key}`);
  };

  const clear = (): void => {
    buffer.clear();
    browserStorage.clear();
  };

  const setRegistrationStatus = (value: RegistrationStatus | undefined): void => {
    browserStorage.set(registrationStatusKey, value ?? "");
  };

  const getRegistrationStatus = (): RegistrationStatus | undefined => {
    return browserStorage.get(registrationStatusKey) as RegistrationStatus | undefined;
  };

  const getCurrentUserId = (): string | undefined => {
    const keys = getCurrentUsers();
    if (keys.length === 0) {
      return undefined;
    }
    if (keys.length > 1) {
      for (const key of keys) {
        _delete(key);
      }
      return undefined;
    }
    return keys[0].split(userDataPrefix)[1];
  };

  const deleteCurrentUser = (): void => {
    const key = getCurrentUserId();
    key && _delete(key);
  };

  const getCurrentUserData = (): UserData | undefined => {
    const key = getCurrentUserId();
    const storedData = key ? get(key) : undefined;
    // Handle SWR cache structure which wraps data in { data, error, _c } format
    if (storedData && typeof storedData === "object" && "data" in storedData) {
      return storedData.data as UserData;
    }
    return storedData;
  };

  const getCurrentUsers = (): string[] => {
    return browserStorage.keys().filter((value: string) => {
      return value.includes(userDataPrefix);
    });
  };

  const prefix = (key: string): string => {
    return key.includes(swrPrefixToIgnore)
      ? ""
      : key.includes(userDataPrefix)
        ? ""
        : userDataPrefix;
  };

  const keys = (): IterableIterator<string> => {
    return buffer.keys();
  };

  return {
    get,
    set,
    clear,
    keys,
    getCurrentUserId,
    getCurrentUserData,
    deleteCurrentUser,
    delete: _delete,
    setRegistrationStatus,
    getRegistrationStatus,
  };
};
