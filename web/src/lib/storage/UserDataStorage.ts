import { BrowserStorage, BrowserStorageFactory } from "@/lib/storage/BrowserStorage";
import {
  registrationStatusList,
  RegistrationStatus,
  UserData,
} from "@businessnjgovnavigator/shared/";

export interface UserDataStorage {
  get: (userId: string) => UserData | undefined;
  set: (userId: string, value: UserData) => boolean;
  delete: (userId: string) => void;
  clear: () => void;
  getCurrentUserData: () => UserData | undefined;
  deleteCurrentUser: () => void;
  getCurrentUserId: () => string | undefined;
  setRegistrationStatus: (value: RegistrationStatus | undefined) => void;
  getRegistrationStatus: () => RegistrationStatus | undefined;
}

interface PersistedUserData {
  readonly version: 1;
  readonly userId: string;
  readonly savedAt: string;
  readonly data: UserData;
}

interface UserDataStorageOptions {
  readonly browserStorage?: BrowserStorage;
  readonly now?: () => Date;
}

type UnknownRecord = Record<string, unknown>;

export const userDataPrefix = "navigator:user-data:";
const legacyUserDataPrefix = "$swrUserData$";
const registrationStatusKey = "selfRegStatus";
const persistedUserDataVersion = 1;
const registrationStatuses: readonly string[] = registrationStatusList;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null;
};

const isUserData = (value: unknown, expectedUserId: string): value is UserData => {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.businesses)) {
    return false;
  }

  if (value.user.id !== expectedUserId || typeof value.currentBusinessId !== "string") {
    return false;
  }

  return isRecord(value.businesses[value.currentBusinessId]);
};

const isPersistedUserData = (
  value: unknown,
  expectedUserId: string,
): value is PersistedUserData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === persistedUserDataVersion &&
    value.userId === expectedUserId &&
    typeof value.savedAt === "string" &&
    isUserData(value.data, expectedUserId)
  );
};

const isRegistrationStatus = (value: string | undefined): value is RegistrationStatus => {
  return value !== undefined && registrationStatuses.includes(value);
};

export const UserDataStorageFactory = (options: UserDataStorageOptions = {}): UserDataStorage => {
  const buffer = new Map<string, UserData>();
  const browserStorage = options.browserStorage ?? BrowserStorageFactory("session");
  const now = options.now ?? ((): Date => new Date());

  const storageKey = (userId: string): string => `${userDataPrefix}${userId}`;
  const legacyStorageKey = (userId: string): string => `${legacyUserDataPrefix}${userId}`;

  const safelyDeleteStorageKey = (key: string): void => {
    try {
      browserStorage.delete(key);
    } catch {
      // Storage can be unavailable even when the in-memory application remains usable.
    }
  };

  const safelyReadStorageKey = (key: string): string | undefined => {
    try {
      return browserStorage.get(key);
    } catch {
      return undefined;
    }
  };

  const safelyReadStorageKeys = (): string[] => {
    try {
      return browserStorage.keys();
    } catch {
      return [];
    }
  };

  const set = (userId: string, value: UserData): boolean => {
    if (!userId || value.user.id !== userId) {
      return false;
    }

    buffer.set(userId, value);
    const persistedUserData: PersistedUserData = {
      version: persistedUserDataVersion,
      userId,
      savedAt: now().toISOString(),
      data: value,
    };

    try {
      return browserStorage.set(storageKey(userId), JSON.stringify(persistedUserData));
    } catch {
      return false;
    }
  };

  const readPersistedUserData = (userId: string): UserData | undefined => {
    const key = storageKey(userId);
    const serializedData = safelyReadStorageKey(key);
    if (!serializedData) {
      return undefined;
    }

    try {
      const parsedData: unknown = JSON.parse(serializedData);
      if (!isPersistedUserData(parsedData, userId)) {
        safelyDeleteStorageKey(key);
        return undefined;
      }
      safelyDeleteStorageKey(legacyStorageKey(userId));
      return parsedData.data;
    } catch {
      safelyDeleteStorageKey(key);
      return undefined;
    }
  };

  const readLegacyUserData = (userId: string): UserData | undefined => {
    const key = legacyStorageKey(userId);
    const serializedData = safelyReadStorageKey(key);
    if (!serializedData) {
      return undefined;
    }

    try {
      const parsedData: unknown = JSON.parse(serializedData);
      if (!isUserData(parsedData, userId)) {
        safelyDeleteStorageKey(key);
        return undefined;
      }

      if (set(userId, parsedData)) {
        safelyDeleteStorageKey(key);
      }
      return parsedData;
    } catch {
      safelyDeleteStorageKey(key);
      return undefined;
    }
  };

  const get = (userId: string): UserData | undefined => {
    if (!userId) {
      return undefined;
    }

    const bufferedData = buffer.get(userId);
    if (bufferedData) {
      return bufferedData;
    }

    const storedData = readPersistedUserData(userId) ?? readLegacyUserData(userId);
    if (storedData) {
      buffer.set(userId, storedData);
    }
    return storedData;
  };

  const deleteUserData = (userId: string): void => {
    if (!userId) {
      return;
    }

    buffer.delete(userId);
    safelyDeleteStorageKey(storageKey(userId));
    safelyDeleteStorageKey(legacyStorageKey(userId));
  };

  const getStoredUserIds = (): string[] => {
    const userIds = safelyReadStorageKeys().flatMap((key) => {
      if (key.startsWith(userDataPrefix)) {
        return [key.slice(userDataPrefix.length)];
      }
      if (key.startsWith(legacyUserDataPrefix)) {
        return [key.slice(legacyUserDataPrefix.length)];
      }
      return [];
    });
    return [...new Set(userIds)].filter(Boolean);
  };

  const getKnownUserIds = (): string[] => {
    return [...new Set([...buffer.keys(), ...getStoredUserIds()])];
  };

  const clear = (): void => {
    buffer.clear();
    for (const key of safelyReadStorageKeys()) {
      if (key.startsWith(userDataPrefix) || key.startsWith(legacyUserDataPrefix)) {
        safelyDeleteStorageKey(key);
      }
    }
  };

  const setRegistrationStatus = (value: RegistrationStatus | undefined): void => {
    try {
      browserStorage.set(registrationStatusKey, value ?? "");
    } catch {
      // Registration can continue in memory when browser storage is unavailable.
    }
  };

  const getRegistrationStatus = (): RegistrationStatus | undefined => {
    const value = safelyReadStorageKey(registrationStatusKey);
    return isRegistrationStatus(value) ? value : undefined;
  };

  const getCurrentUserId = (): string | undefined => {
    const userIds = getKnownUserIds();
    if (userIds.length === 0) {
      return undefined;
    }
    if (userIds.length > 1) {
      for (const userId of userIds) {
        deleteUserData(userId);
      }
      return undefined;
    }

    return get(userIds[0]) ? userIds[0] : undefined;
  };

  const deleteCurrentUser = (): void => {
    const userId = getCurrentUserId();
    if (userId) {
      deleteUserData(userId);
    }
  };

  const getCurrentUserData = (): UserData | undefined => {
    const userId = getCurrentUserId();
    return userId ? get(userId) : undefined;
  };

  return {
    get,
    set,
    clear,
    getCurrentUserId,
    getCurrentUserData,
    deleteCurrentUser,
    delete: deleteUserData,
    setRegistrationStatus,
    getRegistrationStatus,
  };
};
