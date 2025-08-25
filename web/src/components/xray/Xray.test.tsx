import { Xray } from "@/components/xray/Xray";
import * as api from "@/lib/api-client/apiClient";
import analytics from "@/lib/utils/analytics";
import { generateTask, generateXrayRenewalCalendarEvent } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Task, XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";
import type { Business } from "@businessnjgovnavigator/shared/userData";
import type { XrayData } from "@businessnjgovnavigator/shared/xray";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({
  checkXrayRegistrationStatus: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/utils/helpers", () => {
  return {
    ...jest.requireActual("@/lib/utils/helpers"),
    openInNewTab: jest.fn(),
  };
});

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      xray_registration_check_status_form: {
        submit: {
          status_lookup_initiated: jest.fn(),
        },
      },
      xray_registration_check_status_results: {
        appears: {
          active_registration_found: jest.fn(),
          expired_registration_found: jest.fn(),
        },
      },
      xray_registration_check_status_error: {
        appears: {
          record_not_found_error: jest.fn(),
        },
      },
      xray_registration_expired_cta: {
        click: {
          xray_renewal_started_cta: jest.fn(),
        },
      },
      xray_registration_expired_status_card: {
        click: {
          xray_renewal_started_expired_card: jest.fn(),
        },
      },
    },
  };
}

const Config = getMergedConfig();

describe("<Xray />", () => {
  const renderTaskWithBusinessData = (business?: Partial<Business>, task?: Task): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          }),
        )}
      >
        <Xray task={task ?? generateTask({ id: "xray-reg" })} />
      </WithStatefulUserData>,
    );
  };

  const renderRenewalWithBusinessData = (
    business?: Partial<Business>,
    xrayRenewal?: XrayRenewalCalendarEventType,
  ): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          }),
        )}
      >
        <Xray renewal={xrayRenewal ?? generateXrayRenewalCalendarEvent({ id: "xray-renewal" })} />
      </WithStatefulUserData>,
    );
  };

  const goToCheckStatusTab = (): boolean => fireEvent.click(screen.getByTestId("cta-secondary"));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("application", () => {
    it("renders the xray registration task when a task is provided", () => {
      renderTaskWithBusinessData();
      expect(screen.getByText(Config.xrayRegistrationTask.tab1Text)).toBeInTheDocument();
    });

    it("renders the xray renewal task when a renewal is provided", () => {
      renderRenewalWithBusinessData();
      expect(screen.getByText(Config.xrayRenewal.tab1Text)).toBeInTheDocument();
    });

    it("fires renewal analytics event when 'Renew My X-Ray Machine Registration' is clicked", async () => {
      renderRenewalWithBusinessData();
      expect(screen.getByText(Config.xrayRenewal.callToActionPrimaryText)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.xrayRenewal.callToActionPrimaryText));
      expect(
        mockAnalytics.event.xray_registration_expired_cta.click.xray_renewal_started_cta,
      ).toHaveBeenCalled();
    });
  });

  describe("search", () => {
    const userDataWithValidResponse = generateUserDataForBusiness(
      generateBusiness({
        xrayRegistrationData: {
          facilityDetails: {
            businessName: "Valid Business",
            addressLine1: "123 Main St",
            addressLine2: "",
            addressZipCode: "12345",
          },
          status: "ACTIVE",
          expirationDate: getCurrentDate().add(2, "month").toString(),
          machines: [
            {
              registrationNumber: "12345A",
              roomId: "01",
              registrationCategory: "DENTIST",
              name: "CORP",
              modelNumber: "some-model-number",
              serialNumber: "some-serial-number",
              annualFee: 94,
            },
          ],
        },
      }),
    );

    const userDataWithErrorResponse = generateUserDataForBusiness(
      generateBusiness({
        xrayRegistrationData: {
          status: undefined,
          machines: [],
          expirationDate: undefined,
        },
      }),
    );

    it("displays the search page if xray registration data is unavailable", () => {
      renderTaskWithBusinessData();
      goToCheckStatusTab();
      expect(screen.getByText(Config.xrayRegistrationTask.checkStatusText)).toBeInTheDocument();
    });

    it("displays the summary screen when the form is submitted sucessfully", async () => {
      mockApi.checkXrayRegistrationStatus.mockResolvedValue(userDataWithValidResponse);
      renderTaskWithBusinessData();
      goToCheckStatusTab();
      fillOutSearchTab("Valid Business", "123 Main St", "12345");
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("xray-registration-summary")).toBeInTheDocument();
      });
    });

    it("displays FIELDS_REQUIRED error when required fields are empty", async () => {
      renderTaskWithBusinessData({
        profileData: generateProfileData({ businessName: "" }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            addressLine1: "",
            addressLine2: "",
            addressZipCode: "",
          }),
        }),
        xrayRegistrationData: undefined,
      });
      goToCheckStatusTab();
      expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      });
    });

    it("displays NOT_FOUND error when api return empty xrayRegistration data", async () => {
      mockApi.checkXrayRegistrationStatus.mockResolvedValue(userDataWithErrorResponse);
      renderTaskWithBusinessData();
      goToCheckStatusTab();
      expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
      fillOutSearchTab("Invalid Business", "123 Main St", "12345");
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NOT_FOUND")).toBeInTheDocument();
      });
    });

    it("displays SEARCH_FAILED error when api throws an error", async () => {
      mockApi.checkXrayRegistrationStatus.mockRejectedValue({});

      renderTaskWithBusinessData();
      goToCheckStatusTab();
      expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
      fillOutSearchTab("Valid Business", "123 Main St", "12345");
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
      });
    });

    describe("analytics", () => {
      it("fires error analytics event when the api returns empty xrayRegistration data", async () => {
        mockApi.checkXrayRegistrationStatus.mockResolvedValue(userDataWithErrorResponse);
        renderTaskWithBusinessData();
        goToCheckStatusTab();
        expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
        fillOutSearchTab("Invalid Business", "123 Main St", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(
            mockAnalytics.event.xray_registration_check_status_error.appears.record_not_found_error,
          ).toHaveBeenCalled();
        });
      });

      it("fires submit analytics event when submit is clicked", async () => {
        mockApi.checkXrayRegistrationStatus.mockResolvedValue(userDataWithValidResponse);
        renderTaskWithBusinessData();
        goToCheckStatusTab();
        fillOutSearchTab("Valid Business", "123 Main St", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(
            mockAnalytics.event.xray_registration_check_status_form.submit.status_lookup_initiated,
          ).toHaveBeenCalled();
        });
      });

      it("fires active registration found analytics event when xray registration status is ACTIVE", async () => {
        mockApi.checkXrayRegistrationStatus.mockResolvedValue(userDataWithValidResponse);
        renderTaskWithBusinessData();
        goToCheckStatusTab();
        fillOutSearchTab("Valid Business", "123 Main St", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(
            mockAnalytics.event.xray_registration_check_status_results.appears
              .active_registration_found,
          ).toHaveBeenCalled();
        });
      });

      it("fires expired registration found analytics event when xray registration status is EXPIRED", async () => {
        mockApi.checkXrayRegistrationStatus.mockResolvedValue(
          generateUserDataForBusiness(
            generateBusiness({
              xrayRegistrationData: {
                facilityDetails: {
                  businessName: "Valid Business",
                  addressLine1: "123 Main St",
                  addressLine2: "",
                  addressZipCode: "12345",
                },
                status: "EXPIRED",
                expirationDate: getCurrentDate().subtract(2, "month").toString(),
                machines: [
                  {
                    registrationNumber: "12345A",
                    roomId: "01",
                    registrationCategory: "DENTIST",
                    name: "CORP",
                    modelNumber: "some-model-number",
                    serialNumber: "some-serial-number",
                    annualFee: 94,
                  },
                ],
              },
            }),
          ),
        );
        renderTaskWithBusinessData();
        goToCheckStatusTab();
        fillOutSearchTab("Valid Business", "123 Main St", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(
            mockAnalytics.event.xray_registration_check_status_results.appears
              .expired_registration_found,
          ).toHaveBeenCalled();
        });
      });
    });
  });

  describe("summary", () => {
    const renderWithXrayData = (overrides: Partial<XrayData>): void => {
      renderTaskWithBusinessData({
        xrayRegistrationData: {
          facilityDetails: {
            businessName: "Brick and Mortar Store",
            addressLine1: "123 Main St Apt 1",
            addressLine2: "",
            addressZipCode: "12345",
          },
          machines: [
            {
              name: "CORP",
              registrationNumber: "12345A",
              roomId: "01",
              registrationCategory: "DENTIST",
              modelNumber: "123-1234567AB",
              serialNumber: "12-123456AB",
              annualFee: 94,
            },
            {
              name: "GENDEX CORP",
              registrationNumber: "12345B",
              roomId: "01",
              registrationCategory: "DENTIST",
              modelNumber: "123-1234567AB",
              serialNumber: "12-123456AB",
              annualFee: 94,
            },
          ],
          status: "ACTIVE",
          expirationDate: getCurrentDate().add(2, "month").toString(),
          ...overrides,
        },
      });
    };

    it("displays the summary if xray registration data is available", () => {
      renderWithXrayData({});
      expect(screen.getByTestId("xray-registration-summary")).toBeInTheDocument();
    });

    it("takes the user back to the search page when the edit button is clicked on the summary page", () => {
      renderWithXrayData({});
      fireEvent.click(screen.getByText(Config.xrayRegistrationTask.editButtonText));
      expect(screen.getByText(Config.xrayRegistrationTask.checkStatusText)).toBeInTheDocument();
    });

    it("takes the user back to the registration tab when the `go to Start Registration Tab` is clicked on the summary page", () => {
      renderWithXrayData({ status: "INACTIVE" });
      fireEvent.click(screen.getByText(Config.xrayRegistrationTask.editButtonText));
      expect(screen.getByText(Config.xrayRegistrationTask.checkStatusText)).toBeInTheDocument();
    });

    it("fires renewal analytics event when 'Renew your registration now' is clicked", () => {
      renderWithXrayData({ status: "EXPIRED" });
      fireEvent.click(screen.getByText(Config.xrayRegistrationTask.expiredDescriptionCallToAction));
      expect(
        mockAnalytics.event.xray_registration_expired_status_card.click
          .xray_renewal_started_expired_card,
      ).toHaveBeenCalled();
    });
  });

  const fillText = (testid: string, value: string): void => {
    fireEvent.change(screen.getByTestId(testid), { target: { value: value } });
  };

  const fillOutSearchTab = (
    businessName: string,
    address: string,
    addressZipCode: string,
  ): void => {
    fillText("business-name", businessName);
    fillText("address-1", address);
    fillText("addressZipCode", addressZipCode);
  };
});
