import { BrowserStorage } from "@/lib/storage/BrowserStorage";
import { userDataPrefix, UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import {
  BusinessUser,
  generateBusiness,
  generateUser,
  generateUserData,
  generateUserDataForBusiness,
  UserData,
} from "@businessnjgovnavigator/shared";

const legacyUserDataPrefix = "$swrUserData$";
const registrationStatusKey = "selfRegStatus";

const generateUserDataForUser = (user: BusinessUser): UserData => {
  return generateUserDataForBusiness(generateBusiness({ userId: user.id }), { user });
};

interface BrowserStorageHarness {
  readonly browserStorage: jest.Mocked<BrowserStorage>;
  readonly values: Map<string, string>;
}

const createBrowserStorage = (): BrowserStorageHarness => {
  const values = new Map<string, string>();
  const browserStorage: jest.Mocked<BrowserStorage> = {
    get: jest.fn((key) => values.get(key)),
    set: jest.fn((key, value) => {
      values.set(key, value);
      return true;
    }),
    keys: jest.fn(() => [...values.keys()]),
    delete: jest.fn((key) => {
      values.delete(key);
    }),
    clear: jest.fn(() => {
      values.clear();
    }),
  };
  return { browserStorage, values };
};

describe("UserDataStorage", () => {
  it("stores a versioned user-data envelope in its own namespace", () => {
    const { browserStorage, values } = createBrowserStorage();
    const now = new Date("2026-07-16T12:00:00.000Z");
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    const storage = UserDataStorageFactory({ browserStorage, now: () => now });

    expect(storage.set(user.id, userData)).toBe(true);
    expect(storage.get(user.id)).toEqual(userData);
    expect(JSON.parse(values.get(`${userDataPrefix}${user.id}`) ?? "")).toEqual({
      version: 1,
      userId: user.id,
      savedAt: now.toISOString(),
      data: userData,
    });
    expect(values.has(`${legacyUserDataPrefix}${user.id}`)).toBe(false);
  });

  it("returns buffered data without reading browser storage again", () => {
    const { browserStorage } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    const storage = UserDataStorageFactory({ browserStorage });

    storage.set(user.id, userData);
    expect(storage.get(user.id)).toEqual(userData);
    expect(browserStorage.get).not.toHaveBeenCalled();
  });

  it("loads valid persisted data and removes a leftover legacy copy", () => {
    const { browserStorage, values } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);

    UserDataStorageFactory({ browserStorage }).set(user.id, userData);
    values.set(`${legacyUserDataPrefix}${user.id}`, JSON.stringify(userData));

    expect(UserDataStorageFactory({ browserStorage }).get(user.id)).toEqual(userData);
    expect(values.has(`${legacyUserDataPrefix}${user.id}`)).toBe(false);
  });

  it("loads persisted API data when optional interstate fields are omitted", () => {
    const { browserStorage } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    const profileData = userData.businesses[userData.currentBusinessId]
      .profileData as unknown as Record<string, unknown>;
    delete profileData.interstateLogistics;
    delete profileData.interstateMoving;

    UserDataStorageFactory({ browserStorage }).set(user.id, userData);

    expect(UserDataStorageFactory({ browserStorage }).get(user.id)).toEqual(userData);
  });

  it("migrates legacy raw user data and removes the legacy copy", () => {
    const { browserStorage, values } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    values.set(`${legacyUserDataPrefix}${user.id}`, JSON.stringify(userData));

    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.get(user.id)).toEqual(userData);
    expect(values.has(`${userDataPrefix}${user.id}`)).toBe(true);
    expect(values.has(`${legacyUserDataPrefix}${user.id}`)).toBe(false);
  });

  it("retains legacy data when migration cannot be persisted", () => {
    const { browserStorage, values } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    values.set(`${legacyUserDataPrefix}${user.id}`, JSON.stringify(userData));
    browserStorage.set.mockReturnValue(false);

    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.get(user.id)).toEqual(userData);
    expect(values.has(`${legacyUserDataPrefix}${user.id}`)).toBe(true);
  });

  it.each([
    ["malformed JSON", "{"],
    [
      "an unknown envelope version",
      JSON.stringify({ version: 2, userId: "user-1", savedAt: "now", data: {} }),
    ],
    [
      "a mismatched user ID",
      JSON.stringify({
        version: 1,
        userId: "other-user",
        savedAt: "2026-07-16T12:00:00.000Z",
        data: generateUserData({ user: generateUser({ id: "other-user" }) }),
      }),
    ],
  ])("rejects and removes %s", (_, serializedValue) => {
    const { browserStorage, values } = createBrowserStorage();
    values.set(`${userDataPrefix}user-1`, serializedValue);
    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.get("user-1")).toBeUndefined();
    expect(values.has(`${userDataPrefix}user-1`)).toBe(false);
  });

  it.each([
    [
      "an active business without its required nested data",
      (userData: Record<string, unknown>): void => {
        const businesses = userData.businesses as Record<string, unknown>;
        businesses[userData.currentBusinessId as string] = {};
      },
    ],
    [
      "a malformed non-active business",
      (userData: Record<string, unknown>): void => {
        const businesses = userData.businesses as Record<string, unknown>;
        businesses["malformed-business"] = {};
      },
    ],
    [
      "an active business with malformed profile data",
      (userData: Record<string, unknown>): void => {
        const businesses = userData.businesses as Record<string, Record<string, unknown>>;
        businesses[userData.currentBusinessId as string].profileData = {};
      },
    ],
    [
      "a business owned by another user",
      (userData: Record<string, unknown>): void => {
        const businesses = userData.businesses as Record<string, Record<string, unknown>>;
        businesses[userData.currentBusinessId as string].userId = "another-user";
      },
    ],
  ])("rejects and removes %s", (_, makeMalformed) => {
    const { browserStorage, values } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    const malformedUserData = JSON.parse(JSON.stringify(userData)) as Record<string, unknown>;
    makeMalformed(malformedUserData);
    values.set(
      `${userDataPrefix}${user.id}`,
      JSON.stringify({
        version: 1,
        userId: user.id,
        savedAt: "2026-07-17T12:00:00.000Z",
        data: malformedUserData,
      }),
    );

    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.get(user.id)).toBeUndefined();
    expect(values.has(`${userDataPrefix}${user.id}`)).toBe(false);
  });

  it("rejects writes where the key and payload identities differ", () => {
    const { browserStorage } = createBrowserStorage();
    const userData = generateUserData({ user: generateUser({ id: "payload-user" }) });
    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.set("different-user", userData)).toBe(false);
    expect(browserStorage.set).not.toHaveBeenCalled();
  });

  it("keeps in-memory data usable when browser storage throws", () => {
    const { browserStorage } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    browserStorage.set.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.set(user.id, userData)).toBe(false);
    expect(storage.get(user.id)).toEqual(userData);
    expect(storage.getCurrentUserId()).toBe(user.id);
    expect(storage.getCurrentUserData()).toEqual(userData);
  });

  it("handles browser storage being unavailable for reads and deletion", () => {
    const { browserStorage } = createBrowserStorage();
    browserStorage.get.mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    browserStorage.keys.mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    browserStorage.delete.mockImplementation(() => {
      throw new DOMException("Unavailable", "SecurityError");
    });
    const storage = UserDataStorageFactory({ browserStorage });

    expect(storage.get("user-1")).toBeUndefined();
    expect(storage.getCurrentUserId()).toBeUndefined();
    expect(() => storage.delete("user-1")).not.toThrow();
    expect(() => storage.clear()).not.toThrow();
  });

  it("clears only current and legacy user-data namespaces", () => {
    const { browserStorage, values } = createBrowserStorage();
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const storage = UserDataStorageFactory({ browserStorage });
    storage.set(firstUser.id, generateUserData({ user: firstUser }));
    values.set(
      `${legacyUserDataPrefix}${secondUser.id}`,
      JSON.stringify(generateUserData({ user: secondUser })),
    );
    values.set(registrationStatusKey, "IN_PROGRESS");
    values.set("$swr$unrelated", "SWR state");
    values.set("unrelated", "preserve me");
    values.set(userDataPrefix, "malformed namespaced data");
    values.set(legacyUserDataPrefix, "malformed legacy data");

    storage.clear();

    expect([...values.entries()]).toEqual([
      [registrationStatusKey, "IN_PROGRESS"],
      ["$swr$unrelated", "SWR state"],
      ["unrelated", "preserve me"],
    ]);
    expect(browserStorage.clear).not.toHaveBeenCalled();
  });

  it("deletes the only current user", () => {
    const { browserStorage } = createBrowserStorage();
    const user = generateUser({});
    const userData = generateUserDataForUser(user);
    const storage = UserDataStorageFactory({ browserStorage });
    storage.set(user.id, userData);

    expect(storage.getCurrentUserId()).toBe(user.id);
    expect(storage.getCurrentUserData()).toEqual(userData);

    storage.deleteCurrentUser();

    expect(storage.getCurrentUserId()).toBeUndefined();
    expect(storage.get(user.id)).toBeUndefined();
  });

  it("removes ambiguous user data when multiple users are stored", () => {
    const { browserStorage, values } = createBrowserStorage();
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const storage = UserDataStorageFactory({ browserStorage });
    storage.set(firstUser.id, generateUserData({ user: firstUser }));
    storage.set(secondUser.id, generateUserData({ user: secondUser }));

    expect(storage.getCurrentUserId()).toBeUndefined();
    expect([...values.keys()]).toEqual([]);
  });

  it("validates registration status read from storage", () => {
    const { browserStorage, values } = createBrowserStorage();
    const storage = UserDataStorageFactory({ browserStorage });

    storage.setRegistrationStatus("SUCCESS");
    expect(storage.getRegistrationStatus()).toBe("SUCCESS");

    values.set(registrationStatusKey, "not-a-status");
    expect(storage.getRegistrationStatus()).toBeUndefined();
  });
});
