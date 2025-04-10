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

    const results = filterByRegistrationNumber(entries);
    expect(results.length).toEqual(2);
    expect(results[0].registrationNumber).toEqual("12345");
    expect(results[1].registrationNumber).toEqual("54321");
  });
});
