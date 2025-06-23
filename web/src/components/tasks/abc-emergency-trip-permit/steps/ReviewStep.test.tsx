import { ReviewStep } from "@/components/tasks/abc-emergency-trip-permit/steps/ReviewStep";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { EmergencyTripPermitApplicationInfo } from "@businessnjgovnavigator/shared";
import { generateEmergencyTripPermitApplicationData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

describe("Review step", () => {
  describe("Conditional fields", () => {
    let applicationInfo: EmergencyTripPermitApplicationInfo;
    let apiError: boolean;

    beforeEach(() => {
      applicationInfo = generateEmergencyTripPermitApplicationData({});
      apiError = false;
    });

    const renderPage = (): void => {
      render(
        <EmergencyTripPermitContext.Provider
          value={{
            state: {
              applicationInfo,
              stepIndex: 0,
              submitted: false,
              apiError,
            },
            setStepIndex: () => {},
            setSubmitted: () => {},
            setApplicationInfo: () => {},
            setApiError: () => {},
          }}
        >
          <ReviewStep />
        </EmergencyTripPermitContext.Provider>,
      );
    };

    it("shows the text message field if the user indicated they want to send a text message permit link", async () => {
      renderPage();
      expect(screen.queryByText("Text Permit Link To:")).not.toBeInTheDocument();
      applicationInfo = {
        ...applicationInfo,
        shouldSendTextConfirmation: true,
        textMsgMobile: "1234567890",
      };
      renderPage();
      expect(screen.getByText("Text Permit Link To:")).toBeInTheDocument();
      expect(screen.getByText("1234567890")).toBeInTheDocument();
    });

    it("shows the additional email field if the user indicated they want to send permit link to additional email", async () => {
      applicationInfo = generateEmergencyTripPermitApplicationData({
        additionalEmail: "",
        additionalConfirmemail: "",
      });
      renderPage();
      expect(screen.queryByText("Send Permit Link to Alternative Email:")).not.toBeInTheDocument();
      applicationInfo = {
        ...applicationInfo,
        additionalEmail: "email@email.com",
      };
      renderPage();
      expect(screen.getByText("Send Permit Link to Alternative Email:")).toBeInTheDocument();
      expect(screen.getByText("email@email.com")).toBeInTheDocument();
    });
  });
});
