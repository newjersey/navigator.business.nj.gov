import { BrowserStorageFactory } from "@/lib/storage/BrowserStorage";
import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared";

interface UserDataStorage {
  get: (key?: string) => UserData | undefined;
  set: (key: string, value: UserData) => boolean;
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

  const get = (key?: string): UserData | undefined => {
    if (!key) return undefined;
    const bufferData = buffer.get(key);
    if (bufferData) return bufferData;
    const data = browserStorage.get(`${prefix(key)}${key}`);
    if (data) {
      const userObject = JSON.parse(data);
      buffer.set(key, userObject);
      return userObject;
    }
    return undefined;
  };

  const set = (key: string, value: UserData): boolean => {
    if (!key) return false;
    buffer.set(key, value);
    return browserStorage.set(`${prefix(key)}${key}`, JSON.stringify(value));
  };

  const _delete = (key?: string): void => {
    if (!key) return undefined;
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
    if (keys.length == 0) return undefined;
    if (keys.length > 1) {
      keys.forEach((key: string) => _delete(key));
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
    return key ? get(key) : undefined;
  };

  const getCurrentUsers = (): string[] => {
    return browserStorage.keys().filter((value: string) => value.includes(userDataPrefix));
  };

  const prefix = (key: string): string =>
    key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;

  return {
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
