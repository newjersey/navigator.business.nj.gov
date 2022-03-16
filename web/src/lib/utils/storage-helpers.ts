import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared";

type StorageType = "session" | "local";
export type UseStorageReturnValue = {
  get: (key: string, type?: StorageType) => string | undefined;
  set: (key: string, value: string, type?: StorageType) => boolean;
  keys: (type?: StorageType) => string[];
  delete: (key: string, type?: StorageType) => void;
  clear: (type?: StorageType) => void;
};

const UseStorage = (): UseStorageReturnValue => {
  const storageType = (type?: StorageType): "localStorage" | "sessionStorage" =>
    `${type ?? "session"}Storage`;

  const isBrowser: boolean = ((): boolean => typeof window !== "undefined")();

  const get = (key: string, type?: StorageType): string | undefined => {
    return isBrowser ? window[storageType(type)].getItem(key) ?? undefined : undefined;
  };

  const set = (key: string, value: string, type?: StorageType): boolean => {
    if (isBrowser) {
      window[storageType(type)].setItem(key, value);
      return true;
    }
    return false;
  };

  const keys = (type?: StorageType) =>
    [...Array(window[storageType(type)].length)].map((_, i) => window[storageType(type)].key(i)) as string[];

  const clear = (type?: StorageType) => window[storageType(type)].clear();

  const _delete = (key: string, type?: StorageType): void => {
    window[storageType(type)].removeItem(key);
  };

  return {
    get,
    set,
    keys,
    clear,
    delete: _delete,
  };
};

interface UserDataStorageReturnValue {
  get(key?: string): UserData | undefined;
  set(key: string, value: UserData): boolean;
  delete(key?: string): void;
  clear(): void;
  getCurrentUserData(): UserData | undefined;
  deleteCurrentUser(): void;
  getCurrentUserId(): string | undefined;
  setRegistrationStatus(value: RegistrationStatus | undefined): void;
  getRegistrationStatus(): RegistrationStatus | undefined;
}

export const userDataPrefix = "$swrUserData$";
const registrationStatusKey = "selfRegStatus";
export const swrPrefixToIgnore = "$swr$";

const UserDataStorage = (): UserDataStorageReturnValue => {
  const buffer = new Map<string, UserData | undefined>();

  const get = (key: string) => {
    if (!key) return undefined;
    const bufferData = buffer.get(key);
    if (bufferData) return bufferData;
    const prefix = key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;
    const data = UseStorage().get(`${prefix}${key}`);
    if (data) {
      const userObject = JSON.parse(data);
      buffer.set(key, userObject);
      return userObject;
    }
    return undefined;
  };

  const set = (key: string, value: UserData) => {
    if (!key) return false;
    buffer.set(key, value);
    const prefix = key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;
    return UseStorage().set(`${prefix}${key}`, JSON.stringify(value));
  };

  const _delete = (key: string) => {
    if (!key) return undefined;
    buffer.delete(key);
    const prefix = key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;
    UseStorage().delete(`${prefix}${key}`);
  };

  const clear = () => {
    buffer.clear();
    UseStorage().clear();
  };

  const getCurrentUsers = () => {
    return UseStorage()
      .keys()
      .filter((value: string) => value.includes(userDataPrefix));
  };

  const setRegistrationStatus = (value: RegistrationStatus | undefined) => {
    return UseStorage().set(registrationStatusKey, value ?? "");
  };

  const getRegistrationStatus = (): RegistrationStatus | undefined => {
    return UseStorage().get(registrationStatusKey) as RegistrationStatus | undefined;
  };

  const getCurrentUserId = () => {
    const keys = getCurrentUsers();
    if (keys.length == 0) return undefined;
    if (keys.length > 1) {
      keys.forEach((key: string) => _delete(key));
      return undefined;
    }
    return keys[0].split(userDataPrefix)[1];
  };

  const deleteCurrentUser = () => {
    const key = getCurrentUserId();
    key && _delete(key);
  };

  const getCurrentUserData = () => {
    const key = getCurrentUserId();
    return key ? get(key) : undefined;
  };

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
export { UseStorage, UserDataStorage };
