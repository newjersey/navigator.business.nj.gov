import { ElevatorRegistrationTask } from "@/components/tasks/ElevatorRegistrationTask";
import * as api from "@/lib/api-client/apiClient";
import { generateTask } from "@/test/factories";
import {
  generateElevatorSafetyRegistration,
  generateElevatorSafetyRegistrationSummary,
} from "@businessnjgovnavigator/shared/elevatorSafety";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({ checkElevatorRegistrationStatus: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("<ElevatorRegistrationTask />", () => {
  const task = generateTask({});

  const renderTask = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <ElevatorRegistrationTask task={task} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  describe("start application tab", () => {
    it("shows content on first tab", () => {
      renderTask();
      expect(screen.getByText(task.contentMd)).toBeInTheDocument();
    });
  });

  describe("check status tab", () => {
    it("displays error alert when non-optional fields are left blank", async () => {
      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      });
    });

    it("displays error alert when no property interests are found for address", async () => {
      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      fillText("address-1", "123 street");
      expect(screen.queryByTestId("error-alert-NO_PROPERTY_INTEREST_FOUND")).not.toBeInTheDocument();
      const noPropertyInterestResponse = generateElevatorSafetyRegistrationSummary({
        lookupStatus: "NO PROPERTY INTERESTS FOUND",
      });
      mockApi.checkElevatorRegistrationStatus.mockResolvedValue(noPropertyInterestResponse);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NO_PROPERTY_INTEREST_FOUND")).toBeInTheDocument();
      });
    });

    it("displays error alert when no registrations are found for address", async () => {
      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      fillText("address-1", "123 street");
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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
      getToSearchTab();
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

  const getToSearchTab = (): void => {
    fireEvent.click(screen.getByTestId("cta-secondary"));
    fillText("address-1", "123 street");
    expect(screen.getByTestId("address-1")).toBeInTheDocument();
  };
});
