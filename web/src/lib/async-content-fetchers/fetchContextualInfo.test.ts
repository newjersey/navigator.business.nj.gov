import { fetchContextualInfo } from "./fetchContextualInfo";

describe("fetchContextualInfo", () => {
  it("returns a record when a valid id is supplied", async () => {
    const record = await fetchContextualInfo("construction-permits");
    expect(record.header.length).toBeGreaterThan(0);
  });

  it("returns an error when an invalid id is supplied", async () => {
    const record = await fetchContextualInfo("fake-content");
    expect(record.header).toEqual("Content Not Found");
  });
});
