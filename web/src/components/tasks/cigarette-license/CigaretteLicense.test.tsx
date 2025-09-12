import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { postCigaretteLicensePreparePayment, postUserData } from "@/lib/api-client/apiClient";
import { generateTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData, currentBusiness } from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";

import { QUERIES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared/formationData";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateFormationData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({
  postUserData: jest.fn(),
  postCigaretteLicensePreparePayment: jest.fn(),
}));

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const mockApi = {
  postUserData: postUserData as jest.MockedFunction<typeof postUserData>,
  postCigaretteLicensePreparePayment: postCigaretteLicensePreparePayment as jest.MockedFunction<
    typeof postCigaretteLicensePreparePayment
  >,
};
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      cigarette_license: {
        click: {
          switch_to_step_one: jest.fn(),
          switch_to_step_two: jest.fn(),
          switch_to_step_three: jest.fn(),
          switch_to_step_four: jest.fn(),
          step_one_continue_button: jest.fn(),
          step_two_continue_button: jest.fn(),
          step_three_continue_button: jest.fn(),
          step_four_submit_button: jest.fn(),
        },
        submit: {
          validation_error: jest.fn(),
          service_error: jest.fn(),
        },
        appears: { validation_success: jest.fn() },
      },
    },
  };
}

describe("<CigaretteLicense />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  const renderComponent = async (business?: Business, stepIndex?: number): Promise<void> => {
    const userData = generateUserDataForBusiness(business ?? generateBusiness({}));

    render(
      <WithStatefulUserData initialUserData={userData}>
        <CigaretteLicense task={generateTask({ id: "cigarette-license" })} />
      </WithStatefulUserData>,
    );
    if (stepIndex) {
      const tab = screen.getByTestId(`stepper-${stepIndex}`);
      await userEvent.click(tab);
    }
  };

  describe("Stepper Functionality", () => {
    it("renders the first tab on load", async () => {
      await renderComponent();
      const firstTab = screen.getByTestId("stepper-0");
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("navigates to the previous step when back button is clicked", async () => {
      await renderComponent(generateBusiness({}), 1);

      const backButton = screen.getByText(Config.cigaretteLicenseStep2.backButtonText);
      await userEvent.click(backButton);

      expect(mockAnalytics.event.cigarette_license.click.switch_to_step_one).toHaveBeenCalledTimes(
        1,
      );
      expect(screen.getByRole("tab", { name: /General Info/ })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("allows navigation between all steps", async () => {
      await renderComponent();

      const stepsLength = 4;

      for (let stepIndex = 0; stepIndex < stepsLength; stepIndex++) {
        const tab = screen.getByTestId(`stepper-${stepIndex}`);
        await userEvent.click(tab);
        const switchToStepAnalyticsEvents = [
          mockAnalytics.event.cigarette_license.click.switch_to_step_one,
          mockAnalytics.event.cigarette_license.click.switch_to_step_two,
          mockAnalytics.event.cigarette_license.click.switch_to_step_three,
          mockAnalytics.event.cigarette_license.click.switch_to_step_four,
        ];
        expect(switchToStepAnalyticsEvents[stepIndex]).toHaveBeenCalledTimes(1);
        expect(tab).toHaveAttribute("aria-selected", "true");
      }
    });

    it("renders appropriate content for step 2", async () => {
      await renderComponent();

      const secondTab = screen.getByTestId("stepper-1");
      await userEvent.click(secondTab);

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Field Validation", () => {
    describe("Business name field visibility based on business type", () => {
      it.each([
        ["sole-proprietorship", ["Responsible owner name", "Trade name"], ["Business name"]],
        ["general-partnership", ["Responsible owner name", "Trade name"], ["Business name"]],
        ["limited-liability-company", ["Business name"], ["Responsible owner name", "Trade name"]],
        ["c-corporation", ["Business name"], ["Responsible owner name", "Trade name"]],
      ])(
        "for %s business type, %s fields are visible and %s fields are hidden",
        async (legalStructureId, presentFields, hiddenFields) => {
          const business = generateBusiness({
            profileData: generateProfileData({
              legalStructureId: legalStructureId,
            }),
            formationData: generateFormationData({
              formationFormData: createEmptyFormationFormData(),
            }),
          });

          await renderComponent(business, 1);

          for (const field of presentFields) {
            expect(screen.getByLabelText(field)).toBeInTheDocument();
          }
          for (const field of hiddenFields) {
            expect(screen.queryByLabelText(field)).not.toBeInTheDocument();
          }
        },
      );
    });
  });

  describe("Review Step Submit Functionality", () => {
    beforeEach(() => {
      useMockRouter({});
      mockPush.mockClear();

      mockApi.postUserData.mockResolvedValue(generateUserDataForBusiness(generateBusiness({})));
      mockApi.postCigaretteLicensePreparePayment.mockResolvedValue({
        userData: generateUserDataForBusiness(generateBusiness({})),
        paymentInfo: {
          token: "test-token",
          legacyRedirectUrl: "https://success.com?token=test-token",
          htmL5RedirectUrl: "https://success.com?token=test-token",
          errorResult: undefined,
        },
      });
    });

    const renderReviewStep = async (business?: Business): Promise<void> => {
      const userData = generateUserDataForBusiness(business ?? generateBusiness({}));

      render(
        <WithStatefulUserData initialUserData={userData}>
          <CigaretteLicense task={generateTask({ id: "cigarette-license" })} />
        </WithStatefulUserData>,
      );

      const reviewTab = screen.getByTestId("stepper-3");
      await userEvent.click(reviewTab);
    };

    const createValidBusiness = (): Business => {
      return generateBusiness({
        cigaretteLicenseData: generateCigaretteLicenseData({
          signature: true,
          signerName: "Test Signer Name",
          signerRelationship: "Test Signer Relationship",
          mailingAddressIsTheSame: true,
          mailingAddressLine1: "some-mailing-address-1",
          mailingAddressCity: "some-mailing-city",
          mailingAddressState: { shortCode: "NJ", name: "New Jersey" },
          mailingAddressZipCode: "12345",
          salesInfoSupplier: ["Test Supplier"],
        }),
      });
    };

    it("successfully submits cigarette license application and redirects", async () => {
      await renderReviewStep(createValidBusiness());

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(
        mockAnalytics.event.cigarette_license.click.step_four_submit_button,
      ).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("handles internal API error and sets submission error to UNAVAILABLE", async () => {
      mockApi.postCigaretteLicensePreparePayment.mockRejectedValue(new Error("API Error"));

      await renderReviewStep(createValidBusiness());

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      expect(screen.getByText("This service is temporarily unavailable")).toBeInTheDocument();
      expect(mockAnalytics.event.cigarette_license.submit.service_error).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("handles payment error response and sets submission error to UNAVAILABLE", async () => {
      mockApi.postCigaretteLicensePreparePayment.mockResolvedValue({
        userData: generateUserDataForBusiness(generateBusiness({})),
        paymentInfo: {
          token: "",
          errorResult: {
            statusCode: 400,
            errorCode: "PAYMENT_ERROR",
            userMessage: "Payment failed",
            developerMessage: "Payment processing error",
          },
        },
      });

      await renderReviewStep(createValidBusiness());

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      expect(screen.getByText("This service is temporarily unavailable")).toBeInTheDocument();
      expect(mockAnalytics.event.cigarette_license.submit.service_error).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("handles missing payment token and does not redirect", async () => {
      mockApi.postCigaretteLicensePreparePayment.mockResolvedValue({
        userData: generateUserDataForBusiness(generateBusiness({})),
        paymentInfo: {
          token: "",
          errorResult: undefined,
        },
      });

      await renderReviewStep(createValidBusiness());

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("copies business address to mailing address when mailingAddressIsTheSame is true and validation passes", async () => {
      const business = generateBusiness({
        cigaretteLicenseData: generateCigaretteLicenseData({
          signature: true,
          signerName: "Test Signer Name",
          signerRelationship: "Test Signer Relationship",
          mailingAddressIsTheSame: true,
          mailingAddressLine1: "",
          mailingAddressLine2: "",
          mailingAddressCity: "",
          mailingAddressState: undefined,
          mailingAddressZipCode: "",
          addressLine1: "123 Business St",
          addressLine2: "Suite 100",
          addressCity: "Business City",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressZipCode: "12345",
          salesInfoSupplier: ["Test Supplier"],
        }),
      });

      await renderReviewStep(business);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      // Verify that the mailing address fields are now populated with business address values
      expect(screen.getAllByText("123 Business St")).toHaveLength(2);
      expect(screen.getAllByText("Suite 100")).toHaveLength(2);
      expect(screen.getAllByText("Business City")).toHaveLength(2);
      expect(screen.getAllByText("New Jersey")).toHaveLength(2);
      expect(screen.getAllByText("12345")).toHaveLength(2);
    });

    it("does not copy business address to mailing address when mailingAddressIsTheSame is false", async () => {
      const business = generateBusiness({
        cigaretteLicenseData: generateCigaretteLicenseData({
          signature: true,
          signerName: "Test Signer Name",
          signerRelationship: "Test Signer Relationship",
          mailingAddressIsTheSame: false,
          mailingAddressLine1: "456 Mailing Ave",
          mailingAddressLine2: "Apt 2B",
          mailingAddressCity: "Mailing City",
          mailingAddressState: { shortCode: "NY", name: "New York" },
          mailingAddressZipCode: "67890",
          addressLine1: "123 Business St",
          addressLine2: "Suite 100",
          addressCity: "Business City",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressZipCode: "12345",
          salesInfoSupplier: ["Test Supplier"],
        }),
      });

      await renderReviewStep(business);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.postUserData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockApi.postCigaretteLicensePreparePayment).toHaveBeenCalled();
      });

      expect(screen.getByText("456 Mailing Ave")).toBeInTheDocument();
      expect(screen.getByText("Apt 2B")).toBeInTheDocument();
      expect(screen.getByText("Mailing City")).toBeInTheDocument();
      expect(screen.getByText("New York")).toBeInTheDocument();
      expect(screen.getByText("67890")).toBeInTheDocument();

      // Verify that business address fields are still different
      expect(screen.getByText("123 Business St")).toBeInTheDocument();
      expect(screen.getByText("Suite 100")).toBeInTheDocument();
      expect(screen.getByText("Business City")).toBeInTheDocument();
      expect(screen.getByText("New Jersey")).toBeInTheDocument();
      expect(screen.getByText("12345")).toBeInTheDocument();
    });
  });

  describe("query param completePayment", () => {
    it("completePayment=failure show alert on review step", async () => {
      useMockRouter({ isReady: true, query: { [QUERIES.completePayment]: "failure" } });
      await renderComponent();

      expect(screen.getByRole("alert", { name: "error" })).toBeInTheDocument();
    });

    it("completePayment=duplicate show alert on review step", async () => {
      useMockRouter({ isReady: true, query: { [QUERIES.completePayment]: "duplicate" } });
      await renderComponent();

      expect(screen.getByRole("alert", { name: "error" })).toBeInTheDocument();
    });

    it("completePayment=cancel show review step with no alert", async () => {
      useMockRouter({ isReady: true, query: { [QUERIES.completePayment]: "cancel" } });
      await renderComponent();

      expect(screen.queryByRole("alert", { name: "error" })).not.toBeInTheDocument();
    });

    it("completePayment=success should update task and cigarette paymentInfo", async () => {
      useMockRouter({ isReady: true, query: { [QUERIES.completePayment]: "success" } });
      const business = generateBusiness({
        profileData: generateProfileData({}),
        cigaretteLicenseData: generateCigaretteLicenseData({}),
      });
      await renderComponent(business);

      await waitFor(() => {
        expect(currentBusiness().cigaretteLicenseData?.paymentInfo?.paymentComplete).toEqual(true);
      });
      await waitFor(() => {
        expect(currentBusiness().taskProgress["cigarette-license"]).toEqual("COMPLETED");
      });
    });
  });

  describe("payment complete", () => {
    it("if cigarette-license paymentInfo.paymentComplete is true stepper should not show", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({}),
        cigaretteLicenseData: generateCigaretteLicenseData({
          paymentInfo: {
            paymentComplete: true,
            orderId: 12345,
            confirmationEmailsent: true,
          },
        }),
      });

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        await renderComponent(business);
      });

      expect(
        mockAnalytics.event.cigarette_license.appears.validation_success,
      ).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      });
    });
  });
});
