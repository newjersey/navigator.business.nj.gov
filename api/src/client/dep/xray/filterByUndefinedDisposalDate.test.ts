import { filterByUndefinedDisposalDate } from "@client/dep/xray/filterByUndefinedDisposalDate";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("filterByDisposalDate", () => {
  it("returns entries without a disposal date", () => {
    const entries = [
      generateXrayRegistrationEntry({
        disposalDate: "01/01/2023",
      }),
      generateXrayRegistrationEntry({
        disposalDate: "01/01/2023",
      }),
      generateXrayRegistrationEntry({
        disposalDate: undefined,
      }),
      generateXrayRegistrationEntry({
        disposalDate: undefined,
      }),
    ];

    const results = filterByUndefinedDisposalDate(entries);
    expect(results.length).toEqual(2);
    expect(results[0].disposalDate).toEqual(undefined);
    expect(results[1].disposalDate).toEqual(undefined);
  });
});
