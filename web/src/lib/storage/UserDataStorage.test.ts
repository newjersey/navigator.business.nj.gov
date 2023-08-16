import { swrPrefixToIgnore, userDataPrefix, UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { generateUserData } from "@businessnjgovnavigator/shared";

describe("userDataStorage", () => {
  const storage = UserDataStorageFactory();
  const user = generateUserData({});
  let setItemSpy: jest.SpyInstance, getItemSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    getItemSpy = jest.spyOn(global.Storage.prototype, "getItem");
    setItemSpy = jest.spyOn(global.Storage.prototype, "setItem");
    storage.clear();
  });

  it("returns undefined when key does not exist", async () => {
    expect(storage.get("whatever")).toBeUndefined();
  });

  it("stores userData", async () => {
    expect(storage.set("whatever", { data: user })).toBeTruthy();
    expect(storage.get("whatever")?.data).toEqual(user);
  });

  it("deletes stored userData", async () => {
    storage.set("whatever", { data: user });
    storage.delete("whatever");
    expect(storage.get("whatever")).toBeUndefined();
  });

  it("clears stored userData", async () => {
    storage.set("whatever", { data: user });
    storage.clear();
    expect(storage.get("whatever")).toBeUndefined();
  });

  it("sets a prefix key during normal use", async () => {
    storage.set("whatever", { data: user });
    expect(setItemSpy).toHaveBeenCalledWith(`${userDataPrefix}whatever`, JSON.stringify(user));
  });

  it("ignores useSWR internal prefix values", async () => {
    storage.set(`${swrPrefixToIgnore}whatever`, { data: user });
    expect(setItemSpy).toHaveBeenCalledWith(`${swrPrefixToIgnore}whatever`, JSON.stringify(user));
  });

  it("returns stored userData from memory cache after being set", async () => {
    storage.set("whatever", { data: user });
    expect(storage.get("whatever")?.data).toEqual(user);
    expect(getItemSpy).toHaveBeenCalledTimes(0);
  });

  it("returns stored userData from sessionStorage on initialization", async () => {
    getItemSpy.mockImplementation(() => {
      return JSON.stringify(user);
    });
    expect(storage.get("whatever")?.data).toEqual(user);
    expect(getItemSpy).toHaveBeenCalledWith(`${userDataPrefix}whatever`);
  });

  it("returns stored userData from memory cache after initialization", async () => {
    getItemSpy.mockImplementation(() => {
      return JSON.stringify(user);
    });
    expect(storage.get("whatever")?.data).toEqual(user);
    expect(storage.get("whatever")?.data).toEqual(user);
    expect(getItemSpy).toHaveBeenCalledTimes(1);
  });

  it("returns current user id when it exists", async () => {
    storage.set("whatever", { data: user });
    expect(storage.get("whatever")?.data).toEqual(user);
    expect(storage.getCurrentUserId()).toEqual("whatever");
  });

  it("returns current userData when it exists", async () => {
    storage.set("whatever", { data: user });
    expect(storage.getCurrentUserData()).toEqual(user);
  });

  it("deletes current user", async () => {
    storage.set("whatever", { data: user });
    storage.deleteCurrentUser();
    expect(storage.get("whatever")?.data).toBeUndefined();
    expect(storage.getCurrentUserId()).toBeUndefined();
  });

  it("return undefined when if no users or multiple exist", async () => {
    storage.set("whatever", { data: user });
    storage.set("whateve2", { data: user });
    expect(storage.getCurrentUserId()).toBeUndefined();
    storage.clear();
    expect(storage.getCurrentUserId()).toBeUndefined();
  });
});
