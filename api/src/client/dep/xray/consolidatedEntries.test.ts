import { consolidatedEntries } from "@client/dep/xray/consolidatedEntries";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("consolidatedEntries", () => {
  it("returns entries that are present in both arrays", () => {
    const businessNameResults = [
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "67890",
      }),
    ];

    const addressResults = [
      generateXrayRegistrationEntry({
        registrationNumber: "12345",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "54321",
      }),
    ];

    const result = consolidatedEntries(addressResults, businessNameResults);

    expect(result.length).toEqual(1);
    expect(result[0].registrationNumber).toEqual("12345");
  });
});
