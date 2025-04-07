import { filterByRegistrationNumber } from "@client/dep/filterByRegistrationNumber";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("filterByRegistrationNumber", () => {
  it("filters to only include unique registration number", () => {
    const entries = [
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "54321",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "54321",
      }),
    ];

    expect(filterByRegistrationNumber(entries).length).toEqual(2);
  });
});
