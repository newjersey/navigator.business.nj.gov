import { XrayRegistrationTask } from "@/components/tasks/xray-registration/XrayRegistrationTask";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { generateTask } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({
  checkXrayRegistrationStatus: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

describe("<XrayRegistrationTask />", () => {
  const renderTaskAndGoToCheckStatus = (business?: Partial<Business>): void => {
    const task = generateTask({});
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          })
        )}
      >
        <XrayRegistrationTask task={task} />
      </WithStatefulUserData>
    );
    fireEvent.click(screen.getByTestId("cta-secondary"));
  };

  describe("search", () => {
    it("displays the search page if xray registration data is unavailable", () => {
      renderTaskAndGoToCheckStatus();
      expect(screen.getByText(Config.xrayRegistrationTask.checkStatusText)).toBeInTheDocument();
    });

    it("displays FIELDS_REQUIRED error when required fields are empty", async () => {
      renderTaskAndGoToCheckStatus();
      expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      });
    });

    it("displays NOT_FOUND error when api throws a NOT_FOUND error", async () => {
      mockApi.checkXrayRegistrationStatus.mockRejectedValue("NOT_FOUND");

      renderTaskAndGoToCheckStatus();
      expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
      fillOutSearchTab("Invalid Business", "123 Main St", "12345");
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NOT_FOUND")).toBeInTheDocument();
      });
    });

    it("displays SEARCH_FAILED error when api throws an error", async () => {
      mockApi.checkXrayRegistrationStatus.mockRejectedValue({});

      renderTaskAndGoToCheckStatus();
      expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
      fillOutSearchTab("Valid Business", "123 Main St", "12345");
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
      });
    });
  });

  describe("summary", () => {
    const renderWithXrayData = (): void => {
      renderTaskAndGoToCheckStatus({
        xrayRegistrationData: {
          facilityDetails: {
            businessName: "Brick and Mortar Store",
            addressLine1: "123 Main St Apt 1",
            addressLine2: "",
            addressZipCode: "12345",
          },
          machines: [
            {
              name: "Tomographic Machine",
              registrationNumber: "12345A",
              roomId: "01",
              registrationCategory: "Cone Beam Volumetric Tomographic Machine",

              modelNumber: "123-1234567AB",
              serialNumber: "12-123456AB",
              annualFee: 94,
            },
            {
              name: "Dental Unit in Dental Facility",
              registrationNumber: "12345B",
              roomId: "01",
              registrationCategory: "Cone Beam Volumetric Tomographic Machine",

              modelNumber: "123-1234567AB",
              serialNumber: "12-123456AB",
              annualFee: 94,
            },
          ],
          status: "ACTIVE",
          expirationDate: getCurrentDate().add(2, "month").toString(),
        },
      });
    };

    it("displays the summary if xray registration data is available", () => {
      renderWithXrayData();
      expect(screen.getByTestId("xray-registration-summary")).toBeInTheDocument();
    });

    it("takes the user back to the search page when the edit button is clicked on the summary page", () => {
      renderWithXrayData();
      fireEvent.click(screen.getByText(Config.xrayRegistrationTask.editButtonText));
      expect(screen.getByText(Config.xrayRegistrationTask.checkStatusText)).toBeInTheDocument();
    });
  });

  const fillText = (testid: string, value: string): void => {
    fireEvent.change(screen.getByTestId(testid), { target: { value: value } });
  };

  const fillOutSearchTab = (businessName: string, address: string, addressZipCode: string): void => {
    fillText("business-name", businessName);
    fillText("address-1", address);
    fillText("addressZipCode", addressZipCode);
  };
});
