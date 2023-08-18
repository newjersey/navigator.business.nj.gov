import { BrowserStorageFactory } from "@/lib/storage/BrowserStorage";
import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared/";
import { State } from "swr";

interface UserDataStorage {
  get: (key?: string) => State<UserData> | undefined;
  keys: () => IterableIterator<string>;
  set: (key: string, value: State<UserData>) => boolean;
  delete: (key?: string) => void;
  clear: () => void;
  getCurrentUserData: () => UserData | undefined;
  deleteCurrentUser: () => void;
  getCurrentUserId: () => string | undefined;
  setRegistrationStatus: (value: RegistrationStatus | undefined) => void;
  getRegistrationStatus: () => RegistrationStatus | undefined;
}

export const userDataPrefix = "$swrUserData$";
const registrationStatusKey = "selfRegStatus";
export const swrPrefixToIgnore = "$swr$";

export const UserDataStorageFactory = (): UserDataStorage => {
  const buffer = new Map<string, UserData | undefined>();
  const browserStorage = BrowserStorageFactory("session");

  const get = (key?: string): State<UserData> | undefined => {
    if (!key) {
      return undefined;
    }
    const bufferData = buffer.get(key);
    if (bufferData) {
      return {
        data: bufferData,
      };
    }
    const data = browserStorage.get(`${prefix(key)}${key}`);
    if (data && data !== "undefined") {
      const userObject = JSON.parse(data);
      buffer.set(key, userObject);
      return {
        data: userObject,
      };
    }
    return undefined;
  };

  const set = (key: string, value: State<UserData>): boolean => {
    if (!key) {
      return false;
    }
    buffer.set(key, value.data);
    return browserStorage.set(`${prefix(key)}${key}`, JSON.stringify(value.data));
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

  const keys = (): IterableIterator<string> => {
    return getCurrentUsers().values();
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
    return key ? get(key)?.data : undefined;
  };

  const getCurrentUsers = (): string[] => {
    return browserStorage.keys().filter((value: string) => {
      return value.includes(userDataPrefix);
    });
  };

  const prefix = (key: string): string => {
    return key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;
  };

  return {
    keys,
    get,
    set,
    clear,
    getCurrentUserId,
    getCurrentUserData,
    deleteCurrentUser,
    delete: _delete,
    setRegistrationStatus,
    getRegistrationStatus,
  };
};
