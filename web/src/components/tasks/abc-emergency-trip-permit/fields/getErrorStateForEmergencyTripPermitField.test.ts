import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { generateNewEmergencyTripPermitData } from "@businessnjgovnavigator/shared/emergencyTripPermit";

describe("getErrorStateForEmergencyTripPermitField", () => {
  describe("Empty field behavior", () => {
    it("returns the correct error message for an empty, required field", () => {
      const state = generateNewEmergencyTripPermitData();
      expect(getErrorStateForEmergencyTripPermitField("carrier", state)).toStrictEqual({
        field: "carrier",
        hasError: true,
        label: "Enter a ${fieldName}.",
      });
    });

    it("returns no error message for an empty, non-required field", () => {
      const state = generateNewEmergencyTripPermitData();
      expect(getErrorStateForEmergencyTripPermitField("requestorAddress2", state)).toStrictEqual({
        field: "requestorAddress2",
        hasError: false,
        label: "",
      });
    });
  });

  describe("Max Length behavior", () => {
    it("returns error message for required field that is too long", () => {
      const state = generateNewEmergencyTripPermitData();
      const newState = {
        ...state,
        requestorFirstName: "hereIsAnAnswerThatIsQuiteABitMoreThanTheNumberofCharactersAllowed",
      };
      expect(getErrorStateForEmergencyTripPermitField("requestorFirstName", newState)).toStrictEqual({
        field: "requestorFirstName",
        hasError: true,
        label: "${fieldName} must be 35 characters or fewer.",
      });
    });

    it("returns error message for non-required field that is too long", () => {
      const state = generateNewEmergencyTripPermitData();
      const newState = {
        ...state,
        requestorAddress2: "hereIsAnAnswerThatIsQuiteABitMoreThanTheNumberofCharactersAllowed",
      };
      expect(getErrorStateForEmergencyTripPermitField("requestorAddress2", newState)).toStrictEqual({
        field: "requestorAddress2",
        hasError: true,
        label: "${fieldName} must be 35 characters or fewer.",
      });
    });

    describe("Time validation", () => {
      it("displays an error message for a time more than 15 minutes in the past", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "01/01/1990", permitStartTime: "00:00" };
        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: true,
          label: "${fieldName} must be no more than 15 minutes ago.",
        });
      });

      it("displays an error message for a non-selected time", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "01/01/1990", permitStartTime: "" };
        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: true,
          label: "Enter a ${fieldName}.",
        });
        jest.useFakeTimers().setSystemTime(new Date().setUTCMonth(1));
      });

      it("displays an error message for a time more than fifteen minutes ago on same date", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "01/01/2000", permitStartTime: "02:30" };
        const fakeDate = new Date("January 1, 2000 13:00:00 EST");
        jest.useFakeTimers().setSystemTime(fakeDate);

        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: true,
          label: "${fieldName} must be no more than 15 minutes ago.",
        });
      });

      it("displays an error message for a time crossing date threshold", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "12/31/1999", permitStartTime: "23:40" };
        const fakeDate = new Date("January 1, 2000 00:00:00 EST");
        jest.useFakeTimers().setSystemTime(fakeDate);

        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: true,
          label: "${fieldName} must be no more than 15 minutes ago.",
        });
      });

      it("displays no error message for a time crossing date threshold but less than fifteen minutes ago", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "12/31/1999", permitStartTime: "23:50" };
        const fakeDate = new Date("January 1, 2000 00:00:00 EST");
        jest.useFakeTimers().setSystemTime(fakeDate);

        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: false,
          label: "",
        });
      });

      it("displays no error message for a time in the future", () => {
        const state = generateNewEmergencyTripPermitData();
        const newState = { ...state, permitDate: "01/01/2000", permitStartTime: "23:50" };
        const fakeDate = new Date("January 1, 2000 00:00:00 EST");
        jest.useFakeTimers().setSystemTime(fakeDate);

        expect(getErrorStateForEmergencyTripPermitField("permitStartTime", newState)).toStrictEqual({
          field: "permitStartTime",
          hasError: false,
          label: "",
        });
      });
    });
  });
});
