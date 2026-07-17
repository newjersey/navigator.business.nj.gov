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

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const isNumberArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
};

const isOptionalBoolean = (value: unknown): value is boolean | undefined => {
  return value === undefined || typeof value === "boolean";
};

const isBusinessUser = (value: unknown, expectedUserId: string): boolean => {
  return (
    isRecord(value) &&
    value.id === expectedUserId &&
    typeof value.email === "string" &&
    isRecord(value.externalStatus) &&
    typeof value.receiveNewsletter === "boolean" &&
    typeof value.userTesting === "boolean" &&
    typeof value.receiveUpdatesAndReminders === "boolean" &&
    typeof value.accountCreationSource === "string" &&
    typeof value.contactSharingWithAccountCreationPartner === "boolean" &&
    (value.abExperience === "ExperienceA" || value.abExperience === "ExperienceB")
  );
};

const isPreferences = (value: unknown): boolean => {
  return (
    isRecord(value) &&
    isStringArray(value.roadmapOpenSections) &&
    isNumberArray(value.roadmapOpenSteps) &&
    isStringArray(value.visibleSidebarCards) &&
    typeof value.returnToLink === "string" &&
    typeof value.isCalendarFullView === "boolean" &&
    typeof value.isHideableRoadmapOpen === "boolean" &&
    typeof value.phaseNewlyChanged === "boolean"
  );
};

const isProfileData = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.documents)) {
    return false;
  }

  return (
    typeof value.businessName === "string" &&
    typeof value.responsibleOwnerName === "string" &&
    typeof value.tradeName === "string" &&
    typeof value.notes === "string" &&
    typeof value.naicsCode === "string" &&
    typeof value.nexusDbaName === "string" &&
    typeof value.deptOfLaborEin === "string" &&
    typeof value.documents.formationDoc === "string" &&
    typeof value.documents.standingDoc === "string" &&
    typeof value.documents.certifiedDoc === "string" &&
    isStringArray(value.ownershipTypeIds) &&
    isStringArray(value.foreignBusinessTypeIds) &&
    typeof value.operatingPhase === "string" &&
    isRecord(value.nonEssentialRadioAnswers) &&
    typeof value.liquorLicense === "boolean" &&
    typeof value.providesStaffingService === "boolean" &&
    typeof value.certifiedInteriorDesigner === "boolean" &&
    typeof value.realEstateAppraisalManagement === "boolean" &&
    isOptionalBoolean(value.interstateLogistics) &&
    isOptionalBoolean(value.interstateMoving)
  );
};

const isBusiness = (value: unknown, businessId: string, expectedUserId: string): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.id === businessId &&
    value.userId === expectedUserId &&
    typeof value.dateCreatedISO === "string" &&
    typeof value.lastUpdatedISO === "string" &&
    typeof value.dateDeletedISO === "string" &&
    typeof value.version === "number" &&
    typeof value.versionWhenCreated === "number" &&
    (value.onboardingFormProgress === "UNSTARTED" ||
      value.onboardingFormProgress === "COMPLETED") &&
    isProfileData(value.profileData) &&
    isRecord(value.taskProgress) &&
    isRecord(value.taskItemChecklist) &&
    isPreferences(value.preferences) &&
    isRecord(value.taxFilingData) &&
    Array.isArray(value.taxFilingData.filings) &&
    isRecord(value.formationData) &&
    isRecord(value.formationData.formationFormData) &&
    typeof value.formationData.completedFilingPayment === "boolean" &&
    typeof value.formationData.lastVisitedPageIndex === "number" &&
    isRecord(value.roadmapTaskData)
  );
};

const isUserData = (value: unknown, expectedUserId: string): value is UserData => {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.businesses)) {
    return false;
  }

  if (
    !isBusinessUser(value.user, expectedUserId) ||
    typeof value.currentBusinessId !== "string" ||
    typeof value.version !== "number" ||
    typeof value.versionWhenCreated !== "number" ||
    typeof value.dateCreatedISO !== "string" ||
    typeof value.lastUpdatedISO !== "string"
  ) {
    return false;
  }

  const businesses = Object.entries(value.businesses);
  return (
    businesses.length > 0 &&
    businesses.every(([businessId, business]) =>
      isBusiness(business, businessId, expectedUserId),
    ) &&
    isBusiness(value.businesses[value.currentBusinessId], value.currentBusinessId, expectedUserId)
  );
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
