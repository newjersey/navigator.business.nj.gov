import { GetStorage } from "@/lib/utils/storageHelper";
import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared";

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
    const data = GetStorage().get(`${prefix}${key}`);
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
    return GetStorage().set(`${prefix}${key}`, JSON.stringify(value));
  };

  const _delete = (key: string) => {
    if (!key) return undefined;
    buffer.delete(key);
    const prefix = key.includes(swrPrefixToIgnore) ? "" : key.includes(userDataPrefix) ? "" : userDataPrefix;
    GetStorage().delete(`${prefix}${key}`);
  };

  const clear = () => {
    buffer.clear();
    GetStorage().clear();
  };

  const getCurrentUsers = () => {
    return GetStorage()
      .keys()
      .filter((value: string) => value.includes(userDataPrefix));
  };

  const setRegistrationStatus = (value: RegistrationStatus | undefined) => {
    return GetStorage().set(registrationStatusKey, value ?? "");
  };

  const getRegistrationStatus = (): RegistrationStatus | undefined => {
    return GetStorage().get(registrationStatusKey) as RegistrationStatus | undefined;
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
export { UserDataStorage };
