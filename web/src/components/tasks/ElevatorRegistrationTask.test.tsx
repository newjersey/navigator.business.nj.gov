import { ElevatorRegistrationTask } from "@/components/tasks/ElevatorRegistrationTask";
import { HousingMunicipalitiesContext } from "@/contexts/housingMunicipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import analyticsBase from "@/lib/utils/analytics-base";
import { generateTask } from "@/test/factories";
import {
  generateElevatorSafetyRegistration,
  generateElevatorSafetyRegistrationSummary,
} from "@businessnjgovnavigator/shared/elevatorSafety";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/api-client/apiClient", () => ({
  checkElevatorRegistrationStatus: vi.fn(),
}));
const mockApi = api as vi.Mocked<typeof api>;

window.open = vi.fn();
const mockWindowOpen = window.open as vi.Mocked<typeof window.open>;

vi.mock("@/lib/utils/analytics-base", () => ({
  sendEvent: vi.fn(),
  userUpdate: vi.fn(),
  context: { calendar_view: undefined },
}));

const mockAnalyticsBase = analyticsBase as vi.Mocked<typeof analyticsBase>;

describe("<ElevatorRegistrationTask />", () => {
  const task = generateTask({});
  const municipality = { name: "Town Name", id: "12345", county: "County" };

  const renderTask = (): void => {
    render(
      <HousingMunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
        <ThemeProvider theme={createTheme()}>
          <ElevatorRegistrationTask task={task} />
        </ThemeProvider>
      </HousingMunicipalitiesContext.Provider>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  describe("start application tab", () => {
    it("shows content on first tab", () => {
      renderTask();
      expect(screen.getByText(task.contentMd)).toBeInTheDocument();
    });

    it("has CTA that can be clicked", () => {
      renderTask();
      fireEvent.click(screen.getByTestId("cta-primary"));

      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "outbound_link_clicks",
          legacy_event_category: "elevator_registration_button_click_register",
          legacy_event_action: "click",
        })
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(task.callToActionLink, "_blank", "noopener noreferrer");
    });

    it("can get to second tab by clicking tab", () => {
      renderTask();
      expect(screen.queryByTestId("address-1")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("check-status-tab"));
      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "task_tab_clicked",
          legacy_event_category: "check_my_elevator_application_status_tab_click",
          legacy_event_action: "click",
        })
      );

      expect(screen.getByTestId("address-1")).toBeInTheDocument();
    });

    it("can get to second tab by clicking secondary button", () => {
      renderTask();
      expect(screen.queryByTestId("address-1")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("cta-secondary"));
      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "task_tab_continue_button_clicks",
          legacy_event_category: "elevator_registration_button_click_update",
          legacy_event_action: "click",
        })
      );

      expect(screen.getByTestId("address-1")).toBeInTheDocument();
    });
  });

  describe("check status tab", () => {
    it("displays error alert when non-optional fields are left blank", async () => {
      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
      fireEvent.submit(screen.getByTestId("check-status-submit"));

      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "form_submits",
          legacy_event_category: "elevator_registration_form_submission",
          legacy_event_action: "submit",
        })
      );
      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "form_submits",
          legacy_event_category: "elevator_registration_form_submission_failed",
          legacy_event_action: "submit",
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      });
    });

    it("displays error alert when no property interests are found for address", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      expect(screen.queryByTestId("error-alert-NO_PROPERTY_INTEREST_FOUND")).not.toBeInTheDocument();
      const noPropertyInterestResponse = generateElevatorSafetyRegistrationSummary({
        lookupStatus: "NO PROPERTY INTERESTS FOUND",
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(noPropertyInterestResponse);
      fireEvent.submit(screen.getByTestId("check-status-submit"));

      expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "form_submits",
          legacy_event_category: "elevator_registration_form_submission",
          legacy_event_action: "submit",
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NO_PROPERTY_INTEREST_FOUND")).toBeInTheDocument();
      });
    });

    it("displays error alert when no registrations are found for address", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      expect(screen.queryByTestId("error-alert-NO_ELEVATOR_REGISTRATIONS_FOUND")).not.toBeInTheDocument();
      const noRegistrationResponse = generateElevatorSafetyRegistrationSummary({
        lookupStatus: "NO REGISTRATIONS FOUND",
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(noRegistrationResponse);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NO_ELEVATOR_REGISTRATIONS_FOUND")).toBeInTheDocument();
      });
    });
  });

  describe("summary screen", () => {
    it("returns to lookup screen if edit is pressed", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const response = generateElevatorSafetyRegistrationSummary();
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.queryByTestId("address-1")).not.toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("address-edit"));
      expect(screen.getByTestId("address-1")).toBeInTheDocument();
    });

    it("shows the correct information for registration", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const response = generateElevatorSafetyRegistrationSummary();
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });

      expect(screen.getByTestId("registration-0-date")).toBeInTheDocument();
      expect(screen.getByTestId("registration-0-device-count")).toBeInTheDocument();
      expect(screen.getByTestId("registration-0-status")).toBeInTheDocument();
    });

    it("shows the correct number of registrations received", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const approvedResponse = generateElevatorSafetyRegistration();
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [approvedResponse, approvedResponse, approvedResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.getByTestId("registration-1")).toBeInTheDocument();
      expect(screen.getByTestId("registration-2")).toBeInTheDocument();
      expect(screen.queryByTestId("registration-3")).not.toBeInTheDocument();
    });

    it("shows informational message for incomplete status", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const incompleteResponse = generateElevatorSafetyRegistration({ status: "Incomplete" });
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [incompleteResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.getByTestId("registration-0-informational-message")).toBeInTheDocument();
    });

    it("shows informational message for in review status", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const inReviewResponse = generateElevatorSafetyRegistration({ status: "In Review" });
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [inReviewResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.getByTestId("registration-0-informational-message")).toBeInTheDocument();
    });

    it("shows informational message for rejected status", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const rejectedResponse = generateElevatorSafetyRegistration({ status: "Rejected" });
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [rejectedResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.getByTestId("registration-0-informational-message")).toBeInTheDocument();
    });

    it("shows informational message for returned status", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const returnedResponse = generateElevatorSafetyRegistration({ status: "Returned" });
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [returnedResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.getByTestId("registration-0-informational-message")).toBeInTheDocument();
    });

    it("does not show informational message for approved status", async () => {
      renderTask();
      await getToSearchTab();
      fillOutSearchTab("123 street", "Town Name");

      const approvedResponse = generateElevatorSafetyRegistration();
      const response = generateElevatorSafetyRegistrationSummary({
        registrations: [approvedResponse],
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(response);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("registration-0")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("registration-0-informational-message")).not.toBeInTheDocument();
    });
  });

  const fillText = (testid: string, value: string): void => {
    fireEvent.change(screen.getByTestId(testid), { target: { value: value } });
  };

  const getToSearchTab = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId("cta-secondary"));
    await waitFor(() => {
      expect(screen.getByTestId("municipalities")).toBeInTheDocument();
    });
    expect(screen.getByTestId("address-1")).toBeInTheDocument();
  };

  const fillOutSearchTab = (address: string, municipality: string): void => {
    fillText("address-1", address);
    const input = screen.getByTestId("municipalities");
    fillText("municipalities", municipality);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByTestId("municipalities")).toBeInTheDocument();
  };
});
