import { EmergencyTripPermitReviewField } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitReviewField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { render, screen } from "@testing-library/react";

describe("EmergencyTripPermitReviewField", () => {
  let applicationInfo: EmergencyTripPermitApplicationInfo;
  let fieldName: EmergencyTripPermitFieldNames;

  beforeEach(() => {
    applicationInfo = generateNewEmergencyTripPermitData();
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
          },
          setStepIndex: () => {},
          setSubmitted: () => {},
          setApplicationInfo: () => {},
        }}
      >
        <EmergencyTripPermitReviewField fieldName={fieldName} />
      </EmergencyTripPermitContext.Provider>
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
