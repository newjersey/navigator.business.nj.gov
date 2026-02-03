import { filterSquashByRegNumAndAddress } from "@client/dep/xray/filterSquashByRegNumAndAddress";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("filterAndSquashByRegistrationNumber", () => {
  it("filters to only include unique registration number and match the inputted address", () => {
    const entries = [
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
        streetAddress: "123 Main Street",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
        streetAddress: "123 Main St",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "54321",
        streetAddress: "123 Main Street",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "54321",
        streetAddress: "123 Main St",
      }),
    ];

    const results = filterSquashByRegNumAndAddress(entries, "123 Main Street");
    expect(results.length).toEqual(2);
    expect(results[0].registrationNumber).toEqual("12345");
    expect(results[0].streetAddress).toEqual("123 Main Street");

    expect(results[1].registrationNumber).toEqual("54321");
    expect(results[1].streetAddress).toEqual("123 Main Street");
  });
});
