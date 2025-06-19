import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { generateEmergencyTripPermitApplicationData } from "@businessnjgovnavigator/shared/test";

describe("getErrorStateForEmergencyTripPermitField", () => {
  describe("Empty field behavior", () => {
    it("returns the correct error message for an empty, required field", () => {
      const state = generateEmergencyTripPermitApplicationData({ carrier: "" });
      expect(getErrorStateForEmergencyTripPermitField("carrier", state)).toStrictEqual({
        field: "carrier",
        hasError: true,
        label: "Enter a ${fieldName}.",
      });
    });

    it("returns no error message for an empty, non-required field", () => {
      const state = generateEmergencyTripPermitApplicationData({ requestorAddress2: "" });
      expect(getErrorStateForEmergencyTripPermitField("requestorAddress2", state)).toStrictEqual({
        field: "requestorAddress2",
        hasError: false,
        label: "",
      });
    });
  });

  describe("Max Length behavior", () => {
    it("returns error message for required field that is too long", () => {
      const state = generateEmergencyTripPermitApplicationData({
        requestorFirstName: "hereIsAnAnswerThatIsQuiteABitMoreThanTheNumberofCharactersAllowed",
      });
      expect(getErrorStateForEmergencyTripPermitField("requestorFirstName", state)).toStrictEqual({
        field: "requestorFirstName",
        hasError: true,
        label: "${fieldName} must be 35 characters or fewer.",
      });
    });

    it("returns error message for non-required field that is too long", () => {
      const state = generateEmergencyTripPermitApplicationData({
        requestorAddress2: "hereIsAnAnswerThatIsQuiteABitMoreThanTheNumberofCharactersAllowed",
      });
      expect(getErrorStateForEmergencyTripPermitField("requestorAddress2", state)).toStrictEqual({
        field: "requestorAddress2",
        hasError: true,
        label: "${fieldName} must be 35 characters or fewer.",
      });
    });
  });

  describe("Time validation", () => {
    it("displays an error message for a time more than 15 minutes in the past", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "01/01/1990",
        permitStartTime: "00:00",
      });
      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: true,
        label: "${fieldName} must be no more than 15 minutes ago.",
      });
    });

    it("displays an error message for a time more than 5 days in the future", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "01/10/3000",
        permitStartTime: "00:00",
      });
      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: true,
        label: "${fieldName} must be no more than 5 days from now.",
      });
    });

    it("displays an error message for a non-selected time", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "01/01/1990",
        permitStartTime: "",
      });
      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: true,
        label: "Enter a ${fieldName}.",
      });
      jest.useFakeTimers().setSystemTime(new Date().setUTCMonth(1));
    });

    it("displays an error message for a time more than fifteen minutes ago on same date", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "01/01/2000",
        permitStartTime: "02:30",
      });
      const fakeDate = new Date("January 1, 2000 13:00:00 EST");
      jest.useFakeTimers().setSystemTime(fakeDate);

      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: true,
        label: "${fieldName} must be no more than 15 minutes ago.",
      });
    });

    it("displays an error message for a time crossing date threshold", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "12/31/1999",
        permitStartTime: "23:40",
      });
      const fakeDate = new Date("January 1, 2000 00:00:00 EST");
      jest.useFakeTimers().setSystemTime(fakeDate);

      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: true,
        label: "${fieldName} must be no more than 15 minutes ago.",
      });
    });

    it("displays no error message for a time in the future less than 5 days", () => {
      const state = generateEmergencyTripPermitApplicationData({
        permitDate: "01/05/2000",
        permitStartTime: "23:50",
      });
      const fakeDate = new Date("January 1, 2000 00:00:00 EST");
      jest.useFakeTimers().setSystemTime(fakeDate);

      expect(getErrorStateForEmergencyTripPermitField("permitStartTime", state)).toStrictEqual({
        field: "permitStartTime",
        hasError: false,
        label: "",
      });
    });
  });
});
