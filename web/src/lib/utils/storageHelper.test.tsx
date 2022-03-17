import { GetStorage } from "@/lib/utils/storageHelper";

describe("getStorage", () => {
  const storage = GetStorage();

  beforeEach(() => {
    jest.restoreAllMocks();
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
