import { filterByDisposalDate } from "@client/dep/filterByDisposalDate";
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

    expect(filterByDisposalDate(entries).length).toEqual(2);
  });
});
