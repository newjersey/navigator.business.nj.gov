import { fetchAnytimeActionByFilename } from "@/lib/async-content-fetchers/fetchAnytimeActionByFilename";

describe("fetchAnytimeActionByFileName", () => {
  it("returns a record when a valid admin id is supplied", async () => {
    const record = await fetchAnytimeActionByFilename("njstart-registration");
    expect(record.filename).toEqual("njstart-registration");
    expect(record.contentMd.length).toBeGreaterThan(0);
  });

  it("returns a record when a valid license id is supplied", async () => {
    const record = await fetchAnytimeActionByFilename("carnival-ride-supplemental-modification");
    expect(record.filename).toEqual("carnival-ride-supplemental-modification");
    expect(record.contentMd.length).toBeGreaterThan(0);
  });

  it("returns a record when a valid reinstatement id is supplied", async () => {
    const record = await fetchAnytimeActionByFilename("cemetery-reinstatement");
    expect(record.filename).toEqual("cemetery-reinstatement");
    expect(record.contentMd.length).toBeGreaterThan(0);
  });

  it("returns an error when an invalid id is supplied", async () => {
    const record = await fetchAnytimeActionByFilename("fake-content");
    expect(record.contentMd).toEqual("Content Not Found");
  });
});
