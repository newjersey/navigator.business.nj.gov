import { filterByOwnerType } from "@client/dep/xray/filterByOwnerType";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("filterByOwnerType", () => {
  it("filters out entries that are not of type OWNER", () => {
    const entries = [
      generateXrayRegistrationEntry({
        contactType: "OWNER",
      }),
      generateXrayRegistrationEntry({
        contactType: "OWNER",
      }),
      generateXrayRegistrationEntry({
        contactType: "STAFF",
      }),
      generateXrayRegistrationEntry({
        contactType: "STAFF",
      }),
    ];
    const results = filterByOwnerType(entries);
    expect(results.length).toEqual(2);
    expect(results[0].contactType).toEqual("OWNER");
    expect(results[1].contactType).toEqual("OWNER");
  });
});
