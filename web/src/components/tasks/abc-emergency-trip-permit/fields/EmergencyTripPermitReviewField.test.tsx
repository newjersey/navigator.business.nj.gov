import { EmergencyTripPermitReviewField } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitReviewField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitUserEnteredFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { generateEmergencyTripPermitApplicationData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

describe("EmergencyTripPermitReviewField", () => {
  let applicationInfo: EmergencyTripPermitApplicationInfo;
  let fieldName: EmergencyTripPermitUserEnteredFieldNames;

  beforeEach(() => {
    applicationInfo = generateEmergencyTripPermitApplicationData({
      carrier: "",
      permitStartTime: "",
    });
    fieldName = "carrier";
  });

  const renderPage = (): void => {
    render(
      <EmergencyTripPermitContext.Provider
        value={{
          state: {
            applicationInfo,
            stepIndex: 0,
            submitted: false,
            apiError: false,
          },
          setStepIndex: () => {},
          setSubmitted: () => {},
          setApplicationInfo: () => {},
          setApiError: () => {},
        }}
      >
        <EmergencyTripPermitReviewField fieldName={fieldName} />
      </EmergencyTripPermitContext.Provider>,
    );
  };

  it("shows not entered for empty field values", async () => {
    renderPage();
    expect(screen.getByText("Not Entered")).toBeInTheDocument();
  });

  it("shows the value for non-empty field values", async () => {
    applicationInfo = { ...applicationInfo, carrier: "test Carrier" };
    renderPage();
    expect(screen.getByText("test Carrier")).toBeInTheDocument();
    expect(screen.queryByText("Not Entered")).not.toBeInTheDocument();
  });

  it("shows the not entered for empty time value", async () => {
    fieldName = "permitStartTime";
    renderPage();
    expect(screen.getByText("Not Entered")).toBeInTheDocument();
  });

  it("shows the time value in user friendly time for non empty time value", async () => {
    fieldName = "permitStartTime";
    applicationInfo = { ...applicationInfo, permitStartTime: "23:30" };
    renderPage();
    expect(screen.getByText("11:30 pm")).toBeInTheDocument();
  });
});
