import { swrPrefixToIgnore, userDataPrefix, UserDataStorage, UseStorage } from "@/lib/utils/storage-helpers";
import { generateUserData } from "@/test/factories";

describe("storage-helper", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe("UseStorage", () => {
    const storage = UseStorage();

    beforeEach(() => {
      storage.clear();
    });

    it("returns undefined when key does not exist", async () => {
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("stores strings", async () => {
      expect(storage.set("whatever", "zipppp")).toBeTruthy();
    });

    it("returns stored strings", async () => {
      storage.set("whatever", "zipppp");
      expect(storage.get("whatever")).toEqual("zipppp");
    });

    it("deletes stored strings", async () => {
      storage.set("whatever", "zipppp");
      expect(storage.get("whatever")).toEqual("zipppp");
      storage.delete("whatever");
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("clears stored strings", async () => {
      storage.set("whatever", "zipppp");
      storage.clear();
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("gets all keys", async () => {
      storage.set("whatever", "zipppp");
      storage.set("whatever2", "zipppp");
      expect(storage.keys()).toEqual(["whatever", "whatever2"]);
    });
  });

  describe("UserDataStorage", () => {
    const storage = UserDataStorage();
    const user = generateUserData({});
    let setItemSpy: jest.SpyInstance, getItemSpy: jest.SpyInstance;

    beforeEach(() => {
      getItemSpy = jest.spyOn(global.Storage.prototype, "getItem");
      setItemSpy = jest.spyOn(global.Storage.prototype, "setItem");
      storage.clear();
    });

    it("returns undefined when key does not exist", async () => {
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("stores userData", async () => {
      expect(storage.set("whatever", user)).toBeTruthy();
      expect(storage.get("whatever")).toEqual(user);
    });

    it("deletes stored userData", async () => {
      storage.set("whatever", user);
      storage.delete("whatever");
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("clears stored userData", async () => {
      storage.set("whatever", user);
      storage.clear();
      expect(storage.get("whatever")).toBeUndefined();
    });

    it("sets a prefix key during normal use", async () => {
      storage.set("whatever", user);
      expect(setItemSpy).toHaveBeenCalledWith(`${userDataPrefix}whatever`, JSON.stringify(user));
    });

    it("ignores useSWR internal prefix values", async () => {
      storage.set(`${swrPrefixToIgnore}whatever`, user);
      expect(setItemSpy).toHaveBeenCalledWith(`${swrPrefixToIgnore}whatever`, JSON.stringify(user));
    });

    it("returns stored userData from memory cache after being set", async () => {
      storage.set("whatever", user);
      expect(storage.get("whatever")).toEqual(user);
      expect(getItemSpy).toHaveBeenCalledTimes(0);
    });

    it("returns stored userData from sessionStorage on initialization", async () => {
      getItemSpy.mockImplementation(() => JSON.stringify(user));
      expect(storage.get("whatever")).toEqual(user);
      expect(getItemSpy).toHaveBeenCalledWith(`${userDataPrefix}whatever`);
    });

    it("returns stored userData from memory cache after initialization", async () => {
      getItemSpy.mockImplementation(() => JSON.stringify(user));
      expect(storage.get("whatever")).toEqual(user);
      expect(storage.get("whatever")).toEqual(user);
      expect(getItemSpy).toHaveBeenCalledTimes(1);
    });

    it("returns current user id when it exists", async () => {
      storage.set("whatever", user);
      expect(storage.get("whatever")).toEqual(user);
      expect(storage.getCurrentUserId()).toEqual("whatever");
    });

    it("returns current userData when it exists", async () => {
      storage.set("whatever", user);
      expect(storage.getCurrentUserData()).toEqual(user);
    });

    it("deletes current user", async () => {
      storage.set("whatever", user);
      storage.deleteCurrentUser();
      expect(storage.get("whatever")).toBeUndefined();
      expect(storage.getCurrentUserId()).toBeUndefined();
    });

    it("return undefined when if no users or multiple exist", async () => {
      storage.set("whatever", user);
      storage.set("whateve2", user);
      expect(storage.getCurrentUserId()).toBeUndefined();
      storage.clear();
      expect(storage.getCurrentUserId()).toBeUndefined();
    });
  });
});
