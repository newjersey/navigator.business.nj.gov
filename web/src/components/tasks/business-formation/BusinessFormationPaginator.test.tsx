import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import {
  BusinessFormationStepsConfiguration,
  LookupStepIndexByName,
} from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { FormationStepNames, TasksDisplayContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  generateEmptyFormationData,
  generateFormationDbaContent,
  generateFormationSubmitError,
  generateTask,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  mockApiResponse,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { mockPush } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  userDataUpdatedNTimes,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  corpLegalStructures,
  DateObject,
  defaultDateFormat,
  FormationFormData,
  FormationSubmitResponse,
  generateFormationData,
  generateFormationForeignAddress,
  generateFormationUSAddress,
  generateStartingProfileData,
  getCurrentDate,
  ProfileData,
  randomInt,
} from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateMunicipality,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MockApiErrorTestData {
  formationFormData: FormationFormData;
  formationResponse: FormationSubmitResponse;
  formationStepName: FormationStepNames;
  fieldName: string;
  profileData?: ProfileData;
  dropDownLabel?: string;
  dropDownValue?: string;
  datePickerFieldType?: "Business start date" | "Foreign date of formation";
  newDate?: DateObject;
  radioBtnTestId?: string;
  fieldLabel?: string;
  newTextInput?: string;
}

type MockApiErrorJestArray = [string, MockApiErrorTestData];

const Config = getMergedConfig();

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

vi.mock("@/lib/utils/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils/analytics")>("@/lib/utils/analytics");
  actual.default.event.business_formation_location_question.submit.location_entered_for_first_time = vi.fn();
  return actual;
});

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/data-hooks/useDocuments");
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: vi.fn(),
  getCompletedFiling: vi.fn(),
  searchBusinessName: vi.fn(),
}));

const mockAnalytics = vi.mocked(analytics);

describe("<BusinessFormationPaginator />", () => {
  let business: Business;
  let displayContent: TasksDisplayContent;

  beforeEach(() => {
    vi.resetAllMocks();
    useSetupInitialMocks();

    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    displayContent = {
      formationDbaContent: generateFormationDbaContent({}),
    };
    business = generateBusiness({ profileData, formationData });
  });

  describe("button text", () => {
    it("shows unique text on button on first step", () => {
      preparePage({ business, displayContent });
      expect(screen.getByText(Config.formation.general.initialNextButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.general.nextButtonText)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));
      expect(screen.queryByText(Config.formation.general.initialNextButtonText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.formation.general.nextButtonText)).toBeInTheDocument();
    });

    it("does not show previous button on first step", () => {
      preparePage({ business, displayContent });
      expect(screen.queryByText(Config.formation.general.previousButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));
      expect(screen.getByText(Config.formation.general.previousButtonText)).toBeInTheDocument();
    });

    it("shows unique text on last step button", () => {
      const page = preparePage({ business, displayContent });
      page.stepperClickToReviewStep();
      expect(screen.getByText(Config.formation.general.submitButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.general.nextButtonText)).not.toBeInTheDocument();
    });

    it("shows the help button on every formation page", async () => {
      const page = preparePage({ business, displayContent });
      await page.stepperClickToContactsStep();
      expect(screen.getByTestId("help-button")).toBeInTheDocument();
      await page.stepperClickToBusinessStep();
      expect(screen.getByTestId("help-button")).toBeInTheDocument();
      await page.stepperClickToReviewStep();
      expect(screen.getByTestId("help-button")).toBeInTheDocument();
      await page.stepperClickToBusinessNameStep();
      expect(screen.getByTestId("help-button")).toBeInTheDocument();
      await page.stepperClickToBillingStep();
      expect(screen.getByTestId("help-button")).toBeInTheDocument();
    });
  });

  describe("when in guest mode", () => {
    const guestModeNextButtonText = `Register & ${Config.formation.general.initialNextButtonText}`;
    let setShowNeedsAccountModal: () => void;

    beforeEach(() => {
      setShowNeedsAccountModal = vi.fn();
    });

    const renderAsGuest = (): void => {
      render(
        withNeedsAccountContext(
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
            <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
              <BusinessFormation task={generateTask({})} displayContent={displayContent} />
            </MunicipalitiesContext.Provider>
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { showNeedsAccountModal: false, setShowNeedsAccountModal }
        )
      );
    };

    it("prepends register to the next button on first step", async () => {
      renderAsGuest();
      expect(screen.getByText(guestModeNextButtonText)).toBeInTheDocument();
    });

    it("shows Needs Account modal when clicking continue button from step one", () => {
      renderAsGuest();
      fireEvent.click(screen.getByText(guestModeNextButtonText));
      expect(setShowNeedsAccountModal).toHaveBeenCalled();
      expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
    });

    it("shows Needs Account modal when clicking a step in the stepper", () => {
      renderAsGuest();
      fireEvent.click(screen.getByTestId(`stepper-1`));
      expect(setShowNeedsAccountModal).toHaveBeenCalled();
      expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
    });
  });

  describe("when switching steps and user has not yet submitted", () => {
    it("displays dependency alert on first step only", async () => {
      const page = preparePage({ business, displayContent });
      expect(screen.getByTestId("dependency-alert")).toBeInTheDocument();
      await page.stepperClickToBusinessStep();
      expect(screen.queryByTestId("dependency-alert")).not.toBeInTheDocument();
    });

    it("switches steps when clicking the stepper", async () => {
      const page = preparePage({ business, displayContent });
      await page.stepperClickToContactsStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-2")).toHaveFocus();
      await page.stepperClickToBusinessStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-1")).toHaveFocus();
      await page.stepperClickToReviewStep({ useUserEvent: true });

      expect(screen.getByTestId("stepper-4")).toHaveFocus();
      await page.stepperClickToBusinessNameStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-0")).toHaveFocus();
      await page.stepperClickToBillingStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-3")).toHaveFocus();
      expect(screen.getByTestId("billing-step")).toBeInTheDocument();
    });

    it("switches steps when clicking the next and previous buttons", async () => {
      const page = preparePage({ business, displayContent });
      await page.submitBusinessNameStep();
      await page.submitBusinessStep();
      await page.submitContactsStep();
      await page.submitBillingStep();
      fireEvent.click(screen.getByText(Config.formation.general.previousButtonText));
      await waitFor(() => {
        expect(screen.getByTestId("billing-step")).toBeInTheDocument();
      });
    });

    it("switches from error-active to error, persisting the error state on step one even after switching steps", async () => {
      const page = preparePage({ business, displayContent });
      page.fillText("Search business name", "Pizza Joint");
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR-ACTIVE");
      await page.stepperClickToBusinessStep();
      expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR");
    });

    it("maintains the unavailable business name search error, even after switching steps and returning", async () => {
      const page = preparePage({ business, displayContent });
      page.fillText("Search business name", "Pizza Joint");
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR-ACTIVE");
      expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
      await page.stepperClickToBusinessStep();
      await page.stepperClickToBusinessNameStep();
      expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
      expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR-ACTIVE");
    });

    it("maintains the confirm business name error, even after switching steps and returning", async () => {
      const page = preparePage({ business, displayContent });
      await page.fillAndBlurBusinessName("Pizza Joint");
      expect(
        screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch)
      ).toBeInTheDocument();
      await page.stepperClickToBusinessStep();
      await page.stepperClickToBusinessNameStep();
      expect(
        screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch)
      ).toBeInTheDocument();
    });

    const switchingStepTests = (switchStepFunction: () => void): void => {
      it("filters out empty provisions", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBusinessStep();

        fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addButtonText));
        fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addAnotherButtonText));
        fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addAnotherButtonText));
        page.fillText("Provisions 2", "provision2");
        switchStepFunction();
        expect(currentBusiness().formationData.formationFormData.additionalProvisions).toEqual([
          "provision2",
        ]);
        await page.stepperClickToBusinessStep();
        expect(screen.getByLabelText("remove provision")).toBeInTheDocument();
      });

      describe("business name step", () => {
        it("saves name to formation data", async () => {
          const page = preparePage({ business, displayContent });
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          switchStepFunction();
          expect(currentBusiness().formationData.formationFormData.businessName).toEqual("Pizza Joint");

          await page.stepperClickToBusinessNameStep();
          expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
            "Pizza Joint"
          );
        });

        it("saves availability state when switching back to step", async () => {
          const page = preparePage({ business, displayContent });
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          expect(screen.getByTestId("available-text")).toBeInTheDocument();

          switchStepFunction();
          await page.stepperClickToBusinessNameStep();
          expect(screen.getByTestId("available-text")).toBeInTheDocument();
        });

        it("saves name to profile when available", async () => {
          const page = preparePage({ business, displayContent });
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          switchStepFunction();
          expect(currentBusiness().profileData.businessName).toEqual("Pizza Joint");
        });

        it("does not save name to profile when unavailable", async () => {
          const page = preparePage({ business, displayContent });
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "UNAVAILABLE" });
          switchStepFunction();
          expect(currentBusiness().profileData.businessName).toEqual(business.profileData.businessName);
        });

        it("does not save name to profile when error", async () => {
          const page = preparePage({ business, displayContent });
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint LLC");
          await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
          switchStepFunction();
          expect(currentBusiness().profileData.businessName).toEqual(business.profileData.businessName);
        });
      });

      describe("business step", () => {
        it("saves municipality to profile", async () => {
          const businessWithMunicipality = {
            ...business,
            formationData: {
              ...business.formationData,
              formationFormData: {
                ...business.formationData.formationFormData,
                addressMunicipality: generateMunicipality({ displayName: "New Town", name: "New Town" }),
              },
            },
          };
          const page = preparePage({
            business: businessWithMunicipality,
            displayContent,
          });
          await page.stepperClickToBusinessStep();

          page.selectByText("Address municipality", "New Town");
          expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual(
            "New Town"
          );
          switchStepFunction();
          await waitFor(() => {
            expect(currentBusiness().profileData.municipality?.displayName).toEqual("New Town");
          });
          expect(currentBusiness().formationData.formationFormData.addressMunicipality?.displayName).toEqual(
            "New Town"
          );
        });

        it("send analytics when municipality entered for first time", async () => {
          const newTownMuncipality = generateMunicipality({ displayName: "New Town" });

          const businessWithMunicipality = {
            ...business,
            profileData: {
              ...business.profileData,
              municipality: undefined,
            },
          };

          const page = preparePage({
            business: businessWithMunicipality,
            displayContent,
            municipalities: [newTownMuncipality],
          });
          await page.stepperClickToBusinessStep();
          fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
          page.selectByText("Address municipality", "New Town");

          switchStepFunction();
          await waitFor(() => {
            expect(currentBusiness().profileData.municipality?.displayName).toEqual("New Town");
          });

          expect(
            mockAnalytics.event.business_formation_location_question.submit.location_entered_for_first_time
          ).toHaveBeenCalled();
        });

        it("does not send analytics when municipality was already entered", async () => {
          const businessWithMunicipality = {
            ...business,
            formationData: {
              ...business.formationData,
              formationFormData: {
                ...business.formationData.formationFormData,
                addressMunicipality: generateMunicipality({ displayName: "New Town" }),
              },
            },
          };

          const page = preparePage({
            business: businessWithMunicipality,
            displayContent,
          });
          await page.stepperClickToBusinessStep();
          page.selectByText("Address municipality", "New Town");

          switchStepFunction();
          await waitFor(() => {
            expect(
              currentBusiness().formationData.formationFormData.addressMunicipality?.displayName
            ).toEqual("New Town");
          });

          expect(
            mockAnalytics.event.business_formation_location_question.submit.location_entered_for_first_time
          ).not.toHaveBeenCalled();
        });
      });

      it("marks a step incomplete in the stepper when moving from it if required fields are missing", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBillingStep();
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("INCOMPLETE");
      });

      it("marks a step as complete in the stepper if all required fields completed", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();

        switchStepFunction();
        await waitFor(() => {
          expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE");
        });
      });

      it("marks step one as complete if business name is available", async () => {
        const page = preparePage({ business, displayContent });
        page.fillText("Search business name", "Pizza Joint");
        await page.searchBusinessName({ status: "AVAILABLE" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("COMPLETE");
      });

      it("marks step one as error if business name is unavailable", async () => {
        const page = preparePage({ business, displayContent });
        page.fillText("Search business name", "Pizza Joint");
        await page.searchBusinessName({ status: "UNAVAILABLE" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR");
      });

      it("marks step one as error if business name search is error", async () => {
        const page = preparePage({ business, displayContent });
        page.fillText("Search business name", "Pizza Joint LLC");
        await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR");
      });

      it("shows existing inline errors when visiting an INCOMPLETE step with inline errors", async () => {
        const businessWithMunicipality = {
          ...business,
          formationData: {
            ...business.formationData,
            formationFormData: {
              ...business.formationData.formationFormData,
              addressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
            },
          },
        };

        const page = preparePage({ business: businessWithMunicipality, displayContent });
        await page.stepperClickToBusinessStep();
        page.fillText("Address zip code", "22222");
        expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("INCOMPLETE");

        await page.stepperClickToBusinessStep();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("INCOMPLETE-ACTIVE");
        expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
      });
    };

    describe("via next button", () => {
      switchingStepTests(() => {
        fireEvent.click(screen.getByTestId("next-button"));
      });
    });

    describe("via clickable stepper", () => {
      switchingStepTests(() => {
        fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`));
      });
    });
  });

  describe("user attempting to submit", () => {
    describe("with validation errors", () => {
      it("shows error states in stepper for incomplete steps", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();

        expect(screen.queryByText(Config.formation.errorBanner.incompleteStepsError)).not.toBeInTheDocument();
        await page.clickSubmit();

        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Contacts"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Review"))).toEqual("INCOMPLETE-ACTIVE");

        expect(screen.getByText(Config.formation.errorBanner.incompleteStepsError)).toBeInTheDocument();
      });

      it("shows error field states for each step with error except for businessName field", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();
        await page.stepperClickToBusinessStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        await page.stepperClickToContactsStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        await page.stepperClickToBillingStep();
        expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
      });

      it("updates stepper to show error state if user changes a COMPLETE step", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBillingStep();

        expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
        page.fillText("Contact first name", "");

        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("ERROR-ACTIVE");
      });

      it("updates stepper to show COMPLETE if user changes an ERROR step", async () => {
        const page = preparePage({ business, displayContent });
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBillingStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();

        page.completeRequiredBillingFields();
        expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE-ACTIVE");
      });

      it("shows the Trustees label when members' field has an error and legalType is nonprofit", async () => {
        const nonprofit = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              members: undefined,
            }),
          }),
          profileData: generateStartingProfileData({ legalStructureId: "nonprofit" }),
        });
        const page = preparePage({ business: nonprofit, displayContent });

        await page.stepperClickToReviewStep();
        await page.submitReviewStep();

        await page.stepperClickToContactsStep();
        expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.errorBanner.errorOnStep);
        expect(screen.queryByTestId("alert-error")).not.toHaveTextContent(
          Config.formation.fields.members.label
        );
        expect(screen.getByTestId("alert-error")).toHaveTextContent(Config.formation.fields.trustees.label);
      });

      it.each(corpLegalStructures)(
        "shows Board of Directors label when members' field has an error and legalType is %s",
        async (corpLegalStructure) => {
          const corporation = generateBusiness({
            formationData: generateFormationData({
              formationFormData: generateFormationFormData({ members: undefined }),
            }),
            profileData: generateStartingProfileData({
              legalStructureId: corpLegalStructure,
            }),
          });
          const page = preparePage({ business: corporation, displayContent });

          await page.stepperClickToReviewStep();
          await page.submitReviewStep();

          await page.stepperClickToContactsStep();

          expect(screen.getByTestId("alert-error")).toHaveTextContent(
            Config.formation.errorBanner.errorOnStep
          );
          expect(screen.queryByTestId("alert-error")).not.toHaveTextContent(
            Config.formation.fields.members.label
          );
          expect(screen.getByTestId("alert-error")).toHaveTextContent(
            Config.formation.fields.directors.label
          );
        }
      );
    });

    describe("no validation errors", () => {
      let filledInBusiness: Business;

      beforeEach(() => {
        filledInBusiness = {
          ...business,
          formationData: {
            ...business.formationData,
            formationFormData: generateFormationFormData(
              {},
              { legalStructureId: "limited-liability-company" }
            ),
          },
        };
      });

      it("redirects to payment redirect URL on api success", async () => {
        mockApiResponse(
          generateFormationSubmitResponse({
            success: true,
            redirect: "www.example.com",
          })
        );

        const page = preparePage({ business: filledInBusiness, displayContent });
        await page.fillAndSubmitBusinessNameStep();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();
        await waitFor(() => {
          return expect(mockPush).toHaveBeenCalledWith("www.example.com");
        });
      });

      describe("on known API error", () => {
        describe("business name", () => {
          const businessName: MockApiErrorTestData = {
            formationFormData: generateFormationFormData(
              { businessName: "1111111" },
              { legalStructureId: "limited-liability-company" }
            ),
            formationResponse: generateFormationSubmitResponse({
              success: false,
              errors: [
                generateFormationSubmitError({
                  field: "Business Information - Business Name",
                  message: "very bad input",
                  type: "RESPONSE",
                }),
              ],
            }),
            fieldName: "businessName",
            formationStepName: "Name",
            fieldLabel: "Search business name",
            newTextInput: "1234567",
          };

          it("shows error alert and error state on step associated with businessName API error", async () => {
            const { formationFormData, formationResponse, formationStepName } = businessName;

            filledInBusiness = {
              ...business,
              formationData: {
                ...business.formationData,
                formationFormData: formationFormData,
              },
            };

            const filledInBusinessWithApiResponse = {
              ...business,
              formationData: {
                ...business.formationData,
                formationResponse,
              },
            };

            const page = preparePage({ business: filledInBusiness, displayContent });
            await page.fillAndSubmitBusinessNameStep();
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual("COMPLETE");

            await page.stepperClickToReviewStep();
            await page.clickSubmitAndGetError(filledInBusinessWithApiResponse);
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual("ERROR");
            expect(screen.getByText(Config.formation.errorBanner.incompleteStepsError)).toBeInTheDocument();
          });
        });

        describe("starting business persona", () => {
          const businessTotalStock: MockApiErrorJestArray = [
            "businessTotalStock",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "c-corporation",
              }),
              formationFormData: generateFormationFormData(
                { businessTotalStock: "10", businessSuffix: "CO" },
                { legalStructureId: "c-corporation" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Total Shares",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "businessTotalStock",
              formationStepName: "Business",
              fieldLabel: "Business total stock",
              newTextInput: "23",
            },
          ];
          const businessSuffix: MockApiErrorJestArray = [
            "businessSuffix",
            {
              formationFormData: generateFormationFormData(
                { businessSuffix: "LLC" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Business Designator",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "businessSuffix",
              formationStepName: "Business",
              dropDownLabel: "Business suffix",
              dropDownValue: "L.L.C.",
            },
          ];
          const businessStartDate: MockApiErrorJestArray = [
            "businessStartDate",
            {
              formationFormData: generateFormationFormData(
                { businessStartDate: getCurrentDate().format(defaultDateFormat) },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Effective Filing Date",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "businessStartDate",
              formationStepName: "Business",
              datePickerFieldType: "Business start date",
              newDate: getCurrentDate().add(3, "days"),
            },
          ];

          const agentNumber: MockApiErrorJestArray = [
            "agentNumber",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "NUMBER", agentNumber: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Id",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "agentNumber",
              formationStepName: "Contacts",
              fieldLabel: "Agent number",
              newTextInput: "1234567",
            },
          ];
          const agentName: MockApiErrorJestArray = [
            "agentName",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "MANUAL_ENTRY", agentName: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Name",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentName",
              fieldLabel: "Agent name",
              newTextInput: "new name",
            },
          ];
          const agentEmail: MockApiErrorJestArray = [
            "agentEmail",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "MANUAL_ENTRY", agentEmail: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Email",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentEmail",
              fieldLabel: "Agent email",
              newTextInput: "test@test.com",
            },
          ];
          const agentOfficeAddressLine1: MockApiErrorJestArray = [
            "agentOfficeAddressLine1",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "MANUAL_ENTRY", agentOfficeAddressLine1: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Street Address - Address1",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentOfficeAddressLine1",
              fieldLabel: "Agent office address line1",
              newTextInput: "22222222",
            },
          ];
          const agentOfficeAddressLine2: MockApiErrorJestArray = [
            "agentOfficeAddressLine2",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "MANUAL_ENTRY", agentOfficeAddressLine2: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Street Address - Address2",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentOfficeAddressLine2",
              fieldLabel: "Agent office address line2",
              newTextInput: "22222222",
            },
          ];
          const agentOfficeAddressCity: MockApiErrorJestArray = [
            "agentOfficeAddressCity",
            {
              formationFormData: generateFormationFormData(
                {
                  agentNumberOrManual: "MANUAL_ENTRY",
                  agentOfficeAddressCity: `agent-city-${randomInt()}`,
                },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Street Address - City",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentOfficeAddressCity",
              fieldLabel: "Agent office address city",
              newTextInput: "22222222",
            },
          ];
          const agentOfficeAddressZipCode: MockApiErrorJestArray = [
            "agentOfficeAddressZipCode",
            {
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "MANUAL_ENTRY", agentOfficeAddressZipCode: "07004" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Registered Agent - Street Address - Zipcode",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Contacts",
              fieldName: "agentOfficeAddressZipCode",
              fieldLabel: "Agent office address zip code",
              newTextInput: "07005",
            },
          ];

          const contactFirstName: MockApiErrorJestArray = [
            "contactFirstName",
            {
              formationFormData: generateFormationFormData(
                { contactFirstName: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Contact First Name",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Billing",
              fieldName: "contactFirstName",
              fieldLabel: "Contact first name",
              newTextInput: "22222222",
            },
          ];
          const contactLastName: MockApiErrorJestArray = [
            "contactLastName",
            {
              formationFormData: generateFormationFormData(
                { contactLastName: "1111111" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Contact Last Name",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Billing",
              fieldName: "contactLastName",
              fieldLabel: "Contact last name",
              newTextInput: "22222222",
            },
          ];
          const contactPhoneNumber: MockApiErrorJestArray = [
            "contactPhoneNumber",
            {
              formationFormData: generateFormationFormData(
                { contactPhoneNumber: "4325435432" },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Contact Phone Number",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Billing",
              fieldName: "contactPhoneNumber",
              fieldLabel: "Contact phone number",
              newTextInput: "1232343452",
            },
          ];
          const paymentType: MockApiErrorJestArray = [
            "paymentType",
            {
              formationFormData: generateFormationFormData(
                { paymentType: undefined },
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Select Payment Type",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "paymentType",
              formationStepName: "Billing",
              radioBtnTestId: "paymentTypeACHLabel",
            },
          ];

          const combinedInvestment: MockApiErrorJestArray = [
            "combinedInvestment",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),
              formationFormData: generateFormationFormData(
                { combinedInvestment: "1111111" },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Aggregate Amount",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "combinedInvestment",
              fieldLabel: "Combined investment",
              newTextInput: "test@test.com",
            },
          ];
          const createLimitedPartnerTerms: MockApiErrorJestArray = [
            "createLimitedPartnerTerms",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { createLimitedPartnerTerms: "1111111", canCreateLimitedPartner: true },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Create Limited Terms",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "createLimitedPartnerTerms",
              fieldLabel: "Create limited partner terms",
              newTextInput: "test@test.com",
            },
          ];
          const getDistributionTerms: MockApiErrorJestArray = [
            "getDistributionTerms",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { getDistributionTerms: "1111111", canGetDistribution: true },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Get Distribution Terms",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "getDistributionTerms",
              fieldLabel: "Get distribution terms",
              newTextInput: "test@test.com",
            },
          ];
          const makeDistributionTerms: MockApiErrorJestArray = [
            "makeDistributionTerms",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { makeDistributionTerms: "1111111", canMakeDistribution: true },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Make Distribution Terms",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "makeDistributionTerms",
              fieldLabel: "Make distribution terms",
              newTextInput: "test@test.com",
            },
          ];
          const withdrawals: MockApiErrorJestArray = [
            "withdrawals",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { withdrawals: "1111111" },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - General Partner Withdrawal",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "withdrawals",
              fieldLabel: "Withdrawals",
              newTextInput: "test@test.com",
            },
          ];
          const dissolution: MockApiErrorJestArray = [
            "dissolution",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { dissolution: "1111111" },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Dissolution Plan",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "dissolution",
              fieldLabel: "Dissolution",
              newTextInput: "test@test.com",
            },
          ];

          const canCreateLimitedPartner: MockApiErrorJestArray = [
            "canCreateLimitedPartner",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { canCreateLimitedPartner: false },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Create Limited",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "canCreateLimitedPartner",
              formationStepName: "Business",
              radioBtnTestId: "canCreateLimitedPartner-true",
            },
          ];
          const canGetDistribution: MockApiErrorJestArray = [
            "canGetDistribution",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { canGetDistribution: false },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Get Distribution",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "canGetDistribution",
              formationStepName: "Business",
              radioBtnTestId: "canGetDistribution-true",
            },
          ];
          const canMakeDistribution: MockApiErrorJestArray = [
            "canMakeDistribution",
            {
              profileData: generateStartingProfileData({
                legalStructureId: "limited-partnership",
              }),

              formationFormData: generateFormationFormData(
                { canMakeDistribution: false },
                { legalStructureId: "limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Limited Partnership - Limited Can Make Distribution",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              fieldName: "canMakeDistribution",
              formationStepName: "Business",
              radioBtnTestId: "canMakeDistribution-true",
            },
          ];

          it.each([
            businessSuffix,
            businessStartDate,
            businessTotalStock,
            combinedInvestment,
            createLimitedPartnerTerms,
            getDistributionTerms,
            makeDistributionTerms,
            canCreateLimitedPartner,
            canGetDistribution,
            canMakeDistribution,
            withdrawals,
            dissolution,
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressCity,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
            paymentType,
          ])(
            "shows error alert and error state on step associated with %o API error",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName, profileData } = data;

              filledInBusiness = {
                ...business,
                profileData: profileData ? { ...profileData } : { ...business.profileData },
                formationData: {
                  ...business.formationData,
                  formationFormData: formationFormData,
                  formationResponse: formationResponse,
                },
              };
              const page = preparePage({ business: filledInBusiness, displayContent });
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual("ERROR");
              expect(screen.getByText(Config.formation.errorBanner.incompleteStepsError)).toBeInTheDocument();
            }
          );

          it.each([
            businessSuffix,
            businessStartDate,
            businessTotalStock,
            combinedInvestment,
            createLimitedPartnerTerms,
            getDistributionTerms,
            makeDistributionTerms,
            canCreateLimitedPartner,
            canGetDistribution,
            canMakeDistribution,
            withdrawals,
            dissolution,
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressCity,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
            paymentType,
          ])("shows API error message on step for %o API error", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldName, profileData } = data;
            filledInBusiness = {
              ...business,
              profileData: profileData ? { ...profileData } : { ...business.profileData },
              formationData: {
                ...business.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage({ business: filledInBusiness, displayContent });
            await page.fillAndSubmitBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();

            expect(screen.getByTestId("alert-error")).toHaveTextContent(
              Config.formation.errorBanner.errorOnStep
            );
            expect(screen.getByTestId("alert-error")).toHaveTextContent(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (Config.formation.fields as any)[fieldName as string].label
            );
            expect(screen.getByTestId("alert-error")).toHaveTextContent("very bad input");
          });

          it.each([
            businessTotalStock,
            combinedInvestment,
            createLimitedPartnerTerms,
            getDistributionTerms,
            makeDistributionTerms,
            withdrawals,
            dissolution,
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressCity,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
          ])("removes %o API error on blur when user changes text field", async (testTitle, data) => {
            const {
              formationFormData,
              formationResponse,
              formationStepName,
              fieldLabel,
              newTextInput,
              profileData,
            } = data;
            filledInBusiness = {
              ...business,
              profileData: profileData ? { ...profileData } : { ...business.profileData },
              formationData: {
                ...business.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage({ business: filledInBusiness, displayContent });
            await page.fillAndSubmitBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByTestId("alert-error")).toBeInTheDocument();
            page.fillText(fieldLabel as string as string, newTextInput as string);
            expect(screen.queryByTestId("alert-error")).not.toBeInTheDocument();
            expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
              "COMPLETE-ACTIVE"
            );
          });

          it.each([paymentType, canCreateLimitedPartner, canGetDistribution, canMakeDistribution])(
            "removes %o API error when user selects radio button",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName, radioBtnTestId, profileData } =
                data;
              filledInBusiness = {
                ...business,
                profileData: profileData ? { ...profileData } : { ...business.profileData },
                formationData: {
                  ...business.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage({ business: filledInBusiness, displayContent });
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Business") await page.stepperClickToBusinessStep();
              if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
              if (formationStepName === "Billing") await page.stepperClickToBillingStep();
              expect(screen.getByTestId("alert-error")).toBeInTheDocument();
              fireEvent.click(screen.getByTestId(radioBtnTestId as string));
              expect(screen.queryByTestId("alert-error")).not.toBeInTheDocument();
              expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
              expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
                "COMPLETE-ACTIVE"
              );
            }
          );

          it.each([businessSuffix])(
            "removes %o API error when user selects from dropdown and then blur",
            async (testTitle, data) => {
              const {
                formationFormData,
                formationResponse,
                formationStepName,
                dropDownLabel,
                dropDownValue,
              } = data;
              filledInBusiness = {
                ...business,
                formationData: {
                  ...business.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage({ business: filledInBusiness, displayContent });
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Business") await page.stepperClickToBusinessStep();
              expect(screen.getByTestId("alert-error")).toBeInTheDocument();

              page.selectByText(dropDownLabel as string, dropDownValue as string);
              fireEvent.focusOut(screen.getAllByLabelText(dropDownLabel as string)[0]);

              expect(screen.queryByTestId("alert-error")).not.toBeInTheDocument();
              expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
              expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
                "COMPLETE-ACTIVE"
              );
            }
          );

          it.each([businessStartDate])(
            "removes %o API error when user selects from date picker",
            async (testTitle, data) => {
              const {
                formationFormData,
                formationResponse,
                formationStepName,
                newDate,
                datePickerFieldType,
              } = data as MockApiErrorTestData;
              filledInBusiness = {
                ...business,
                formationData: {
                  ...business.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage({ business: filledInBusiness, displayContent });
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Business") await page.stepperClickToBusinessStep();
              expect(screen.getByTestId("alert-error")).toBeInTheDocument();

              page.selectDate(
                newDate as DateObject,
                datePickerFieldType as "Business start date" | "Foreign date of formation"
              );

              expect(screen.queryByTestId("alert-error")).not.toBeInTheDocument();
              expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
              expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
                "COMPLETE-ACTIVE"
              );
            }
          );
        });

        describe("foreign business persona", () => {
          const foreignUsMainAddressLine1: MockApiErrorJestArray = [
            "foreignUsMainAddressLine1",
            {
              formationFormData: generateFormationFormData(
                {
                  ...generateFormationUSAddress({}),
                  businessSuffix: "LLC",
                  businessLocationType: "US",
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Address1",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressLine1",
              fieldLabel: "Address line1",
              newTextInput: "some new text",
            },
          ];
          const foreignUsMainAddressLine2: MockApiErrorJestArray = [
            "foreignUsMainAddressLine2",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationUSAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Address2",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressLine2",
              fieldLabel: "Address line2",
              newTextInput: "some new text",
            },
          ];
          const foreignUsMainAddressCity: MockApiErrorJestArray = [
            "foreignUsMainAddressCity",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationUSAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - City",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressCity",
              fieldLabel: "Address city",
              newTextInput: "some new text",
            },
          ];
          const foreignUsMainAddressState: MockApiErrorJestArray = [
            "foreignUsMainAddressState",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationUSAddress({ addressState: undefined }),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - State",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressState",
              fieldLabel: "Address state",
              newTextInput: "AZ",
            },
          ];
          const foreignUsMainAddressZipCode: MockApiErrorJestArray = [
            "foreignUsMainAddressZipCode",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationUSAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Zipcode",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressZipCode",
              fieldLabel: "Address zip code",
              newTextInput: "12345",
            },
          ];

          const foreignIntlMainAddressLine1: MockApiErrorJestArray = [
            "foreignIntlMainAddressLine1",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Address1",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressLine1",
              fieldLabel: "Address line1",
              newTextInput: "some new text",
            },
          ];
          const foreignIntlMainAddressLine2: MockApiErrorJestArray = [
            "foreignIntlMainAddressLine2",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Address2",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressLine2",
              fieldLabel: "Address line2",
              newTextInput: "some new text",
            },
          ];
          const foreignIntlMainAddressCity: MockApiErrorJestArray = [
            "foreignIntlMainAddressCity",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - City",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressCity",
              fieldLabel: "Address city",
              newTextInput: "some new text",
            },
          ];
          const foreignIntlMainAddressProvince: MockApiErrorJestArray = [
            "foreignIntlMainAddressProvince",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Province",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressProvince",
              fieldLabel: "Address province",
              newTextInput: "some new text",
            },
          ];
          const foreignIntlMainAddressZipCode: MockApiErrorJestArray = [
            "foreignUsMainAddressZipCode",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({}),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Zipcode",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressZipCode",
              fieldLabel: "Address zip code",
              newTextInput: "12345",
            },
          ];
          const foreignIntlMainAddressCountry: MockApiErrorJestArray = [
            "foreignIntlMainAddressCountry",
            {
              formationFormData: generateFormationFormData(
                {
                  businessSuffix: "LLC",
                  ...generateFormationForeignAddress({ addressCountry: undefined }),
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Street Address - Country",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "addressCountry",
              fieldLabel: "Address country",
              newTextInput: "Germany",
            },
          ];

          const foreignStateOfFormation: MockApiErrorJestArray = [
            "foreignStateOfFormation",
            {
              formationFormData: generateFormationFormData(
                {
                  ...generateFormationUSAddress({}),
                  businessSuffix: "LLC",
                  businessLocationType: "US",
                  foreignStateOfFormation: undefined,
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Foreign State Of Formation",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "foreignStateOfFormation",
              fieldLabel: "Foreign state of formation",
              newTextInput: "California",
            },
          ];

          const foreignDateOfFormation: MockApiErrorJestArray = [
            "foreignDateOfFormation",
            {
              formationFormData: generateFormationFormData(
                {
                  ...generateFormationUSAddress({}),
                  businessSuffix: "LLC",
                  businessLocationType: "US",
                  foreignDateOfFormation: undefined,
                },
                { legalStructureId: "foreign-limited-partnership" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "Business Information - Foreign Date Of Formation",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                ],
              }),
              formationStepName: "Business",
              fieldName: "foreignDateOfFormation",
              fieldLabel: "Foreign date of formation",
              newTextInput: "01/01/2020",
            },
          ];

          it.each([
            foreignUsMainAddressLine1,
            foreignUsMainAddressLine2,
            foreignUsMainAddressCity,
            foreignUsMainAddressState,
            foreignUsMainAddressZipCode,
            foreignIntlMainAddressLine1,
            foreignIntlMainAddressLine2,
            foreignIntlMainAddressCity,
            foreignIntlMainAddressProvince,
            foreignIntlMainAddressZipCode,
            foreignIntlMainAddressCountry,
            foreignStateOfFormation,
            foreignDateOfFormation,
          ])(
            "shows error alert and error state on step associated with %o API error",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName } = data;

              filledInBusiness = {
                ...business,
                profileData: { ...business.profileData, businessPersona: "FOREIGN" },
                formationData: {
                  ...business.formationData,
                  formationFormData: formationFormData,
                  formationResponse: formationResponse,
                },
              };
              const page = preparePage({ business: filledInBusiness, displayContent });
              await page.fillAndSubmitNexusBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual("ERROR");
              expect(screen.getByText(Config.formation.errorBanner.incompleteStepsError)).toBeInTheDocument();
            }
          );

          it.each([
            foreignUsMainAddressLine1,
            foreignUsMainAddressLine2,
            foreignUsMainAddressCity,
            foreignUsMainAddressState,
            foreignUsMainAddressZipCode,
            foreignIntlMainAddressLine1,
            foreignIntlMainAddressLine2,
            foreignIntlMainAddressCity,
            foreignIntlMainAddressProvince,
            foreignIntlMainAddressZipCode,
            foreignIntlMainAddressCountry,
            foreignStateOfFormation,
            foreignDateOfFormation,
          ])("shows API error message on step for %o API error", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldName } = data;
            filledInBusiness = {
              ...business,
              profileData: { ...business.profileData, businessPersona: "FOREIGN" },
              formationData: {
                ...business.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage({ business: filledInBusiness, displayContent });
            await page.fillAndSubmitNexusBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByTestId("alert-error")).toHaveTextContent(
              Config.formation.errorBanner.errorOnStep
            );
            expect(screen.getByTestId("alert-error")).toHaveTextContent(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (Config.formation.fields as any)[fieldName as string].label
            );
            expect(screen.getByTestId("alert-error")).toHaveTextContent("very bad input");
          });

          it.each([
            foreignUsMainAddressLine1,
            foreignUsMainAddressLine2,
            foreignUsMainAddressCity,
            foreignUsMainAddressState,
            foreignUsMainAddressZipCode,
            foreignIntlMainAddressLine1,
            foreignIntlMainAddressLine2,
            foreignIntlMainAddressCity,
            foreignIntlMainAddressProvince,
            foreignIntlMainAddressZipCode,
            foreignIntlMainAddressCountry,
            foreignStateOfFormation,
            foreignDateOfFormation,
          ])("removes %o API error on blur when user changes text field", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldLabel, newTextInput } =
              data;
            filledInBusiness = {
              ...filledInBusiness,
              profileData: { ...filledInBusiness.profileData, businessPersona: "FOREIGN" },
              formationData: {
                ...filledInBusiness.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage({ business: filledInBusiness, displayContent });
            await page.fillAndSubmitNexusBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByTestId("alert-error")).toBeInTheDocument();

            page.fillText(fieldLabel as string as string, newTextInput as string);
            await waitFor(() => {
              expect(screen.queryByTestId("alert-error")).not.toBeInTheDocument();
            });
            expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
              "COMPLETE-ACTIVE"
            );
          });
        });
      });

      describe("on unknown API error (generic)", () => {
        beforeEach(() => {
          filledInBusiness = {
            ...business,
            formationData: {
              ...business.formationData,
              formationFormData: generateFormationFormData(
                {},
                { legalStructureId: "limited-liability-company" }
              ),
              formationResponse: generateFormationSubmitResponse({
                success: false,
                errors: [
                  generateFormationSubmitError({
                    field: "some field 1",
                    message: "very bad input",
                    type: "RESPONSE",
                  }),
                  generateFormationSubmitError({
                    field: "some field 2",
                    message: "must be nj zipcode",
                    type: "RESPONSE",
                  }),
                ],
              }),
            },
          };
        });

        it("displays generic messages on API error on all steps", async () => {
          const page = preparePage({ business: filledInBusiness, displayContent });
          await page.stepperClickToReviewStep();

          expect(screen.getByText("some field 1")).toBeInTheDocument();
          expect(screen.getByText("very bad input")).toBeInTheDocument();
          expect(screen.getByText("some field 2")).toBeInTheDocument();
          expect(screen.getByText("must be nj zipcode")).toBeInTheDocument();
          await page.stepperClickToBillingStep();

          expect(screen.getByText("some field 1")).toBeInTheDocument();
          expect(screen.getByText("very bad input")).toBeInTheDocument();
          expect(screen.getByText("some field 2")).toBeInTheDocument();
          expect(screen.getByText("must be nj zipcode")).toBeInTheDocument();
        });

        it("still shows all steps as complete", async () => {
          const page = preparePage({ business: filledInBusiness, displayContent });
          await page.fillAndSubmitBusinessNameStep();
          await page.stepperClickToReviewStep();

          expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("COMPLETE");
          expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("COMPLETE");
          expect(page.getStepStateInStepper(LookupStepIndexByName("Contacts"))).toEqual("COMPLETE");
          expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE");
          expect(page.getStepStateInStepper(LookupStepIndexByName("Review"))).toEqual("INCOMPLETE-ACTIVE");
        });
      });
    });
  });

  describe("autosave", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("autosaves every second if a field has changed", async () => {
      const page = preparePage({ business, displayContent });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      page.fillText("Search business name", "Pizza Joint");
      await waitFor(() =>
        expect(currentBusiness().formationData.formationFormData.businessName).toEqual("Pizza Joint")
      );
    });

    it("autosaves every second if business name availability has changed", async () => {
      const businessWithName = {
        ...business,
        profileData: { ...business.profileData, businessName: "old-name" },
        formationData: {
          ...business.formationData,
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
        },
      };
      const page = preparePage({ business: businessWithName, displayContent });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      page.fillText("Search business name", "Pizza Joint");
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
      await waitFor(() => {
        expect(currentBusiness().formationData.businessNameAvailability?.status).toEqual("UNAVAILABLE");
      });
    });

    it("does not autosave if fields have not changed", () => {
      preparePage({ business, displayContent });
      expect(userDataUpdatedNTimes()).toEqual(1);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(userDataUpdatedNTimes()).toEqual(1);
    });

    it("does not filter user data when autosaving, only when switching steps", async () => {
      const page = preparePage({ business, displayContent });
      await page.stepperClickToBusinessStep();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      fireEvent.click(screen.getByText(Config.formation.fields.additionalProvisions.addButtonText));

      await waitFor(() =>
        expect(currentBusiness().formationData.formationFormData.additionalProvisions).toEqual([""])
      );
      await page.stepperClickToContactsStep();
      await page.stepperClickToBusinessStep();
      expect(currentBusiness().formationData.formationFormData.additionalProvisions).toEqual([]);
    });

    it("does not autosave if a field has changed but less than 1 second has passed", () => {
      const page = preparePage({ business, displayContent });
      expect(userDataUpdatedNTimes()).toEqual(1);
      makeChangeToForm(page);
      act(() => {
        vi.advanceTimersByTime(900);
      });
      expect(userDataUpdatedNTimes()).toEqual(1);
    });

    it("displays the saving spinner every 1 min, for 2.5 seconds at a time", async () => {
      const page = preparePage({ business, displayContent });
      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      makeChangeToForm(page);
      await waitFor(() =>
        expect(currentBusiness().formationData.formationFormData.businessName).toEqual("Pizza Joint")
      );

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(59000);
      });

      expect(screen.getByText(Config.autosaveDefaults.savingText)).toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.autosaveDefaults.savedText)).toBeInTheDocument();
    });

    it("does not display the saving spinner if no saves occurred in that 1 min", async () => {
      const page = preparePage({ business, displayContent });

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      makeChangeToForm(page);
      act(() => {
        vi.advanceTimersByTime(59000);
      });
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.autosaveDefaults.savedText)).toBeInTheDocument();

      act(() => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();
    });

    const makeChangeToForm = (page: FormationPageHelpers): void => {
      page.fillText("Search business name", "Pizza Joint");
    };
  });

  describe("remembers formation step", () => {
    it("shows the Business Step with an initial user when lastVisitedPage has index 0 which is by default", async () => {
      preparePage({ business, displayContent });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(0);
      });
    });

    it("shows the last formation step when lastVisitedPage has step index 4", () => {
      const legalStructureId = "limited-liability-company";
      const profileData = generateFormationProfileData({ legalStructureId });
      const formationData = generateFormationData({ lastVisitedPageIndex: 4 });

      business = generateBusiness({ profileData, formationData });
      preparePage({ business, displayContent });
      expect(screen.getByTestId("review-step")).toBeInTheDocument();
    });

    it("lastVistedPage updates on step change via stepper", async () => {
      const page = preparePage({ business, displayContent });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();

      await page.stepperClickToBillingStep();
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(3);
      });

      await page.stepperClickToBusinessStep();
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(1);
      });
    });

    it("lastVisitedPage updates on step change via the previous and next button steps", async () => {
      preparePage({ business, displayContent });

      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(0);
      });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("next-button"));
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(1);
      });
      expect(screen.getByTestId("business-step")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("next-button"));
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(2);
      });
      expect(screen.getByTestId("contacts-step")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("previous-button"));
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(1);
      });
      expect(screen.getByTestId("business-step")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("previous-button"));
      await waitFor(() => {
        expect(currentBusiness().formationData.lastVisitedPageIndex).toEqual(0);
      });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
    });

    it("defaults to first formation step when we go above 4 for page index", () => {
      const profileData = generateFormationProfileData({});
      const formationData = generateFormationData({
        lastVisitedPageIndex: BusinessFormationStepsConfiguration.length,
      });

      business = generateBusiness({ profileData, formationData });
      preparePage({ business, displayContent });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
    });

    it("defaults to first formation step when we go below 0 for page index", () => {
      const profileData = generateFormationProfileData({});
      const formationData = generateFormationData({ lastVisitedPageIndex: -1 });

      business = generateBusiness({ profileData, formationData });
      preparePage({ business, displayContent });
      expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
    });
  });

  describe("Accessibility Related", () => {
    it("Moves focus when using arrow keys in Stepper", async () => {
      const page = preparePage({ business, displayContent });
      await page.stepperClickToContactsStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-2")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByTestId("stepper-3")).toHaveFocus();
    });

    it("Selects a step on keyboard enter press", async () => {
      const page = preparePage({ business, displayContent });
      await page.stepperClickToContactsStep({ useUserEvent: true });
      expect(screen.getByTestId("stepper-2")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByTestId("stepper-3")).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(screen.getByTestId("billing-step")).toBeInTheDocument();
    });

    it("has correctly composed aria labels", () => {
      preparePage({ business, displayContent });
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Name")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Name")
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Name")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining(Config.formation.general.ariaContextStepperStateIncomplete)
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Business")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Business")
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Business")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining(Config.formation.general.ariaContextStepperStateIncomplete)
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Contacts")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Contacts")
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Contacts")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining(Config.formation.general.ariaContextStepperStateIncomplete)
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Billing")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Billing")
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Billing")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining(Config.formation.general.ariaContextStepperStateIncomplete)
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Review")
      );
      expect(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`)).toHaveAttribute(
        "aria-label",
        expect.stringContaining(Config.formation.general.ariaContextStepperStateIncomplete)
      );
    });
  });
});
