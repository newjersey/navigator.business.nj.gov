import { fetchQuickActionByFilename } from "@/lib/async-content-fetchers/fetchQuickActionByFilename";

describe("fetchQuickActionByFileName", () => {
  it("returns a record when a valid id is supplied", async () => {
    const record = await fetchQuickActionByFilename("njstart-registration");
    expect(record.filename).toEqual("njstart-registration");
    expect(record.contentMd.length).toBeGreaterThan(0);
  });

  it("returns an error when an invalid id is supplied", async () => {
    const record = await fetchQuickActionByFilename("fake-content");
    expect(record.contentMd).toEqual("Content Not Found");
  });
});
