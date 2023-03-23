import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { FormationStepNames, TasksDisplayContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  generateEmptyFormationData,
  generateFormationDbaContent,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateTask,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  mockApiResponse,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { mockPush } from "@/test/mock/mockRouter";
import {
  currentUserData,
  userDataUpdatedNTimes,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  DateObject,
  defaultDateFormat,
  FormationFormData,
  FormationSubmitResponse,
  generateFormationForeignAddress,
  generateFormationUSAddress,
  getCurrentDate,
} from "@businessnjgovnavigator/shared/";
import { generateFormationFormData, generateMunicipality } from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

interface MockApiErrorTestData {
  formationFormData: FormationFormData;
  formationResponse: FormationSubmitResponse;
  formationStepName: FormationStepNames;
  fieldName: string;
  dropDownLabel?: string;
  dropDownValue?: string;
  datePickerFieldType?: "Business start date" | "Foreign date of formation";
  newDate?: DateObject;
  radioBtnText?: string;
  fieldLabel?: string;
  newTextInput?: string;
}

type MockApiErrorJestArray = [string, MockApiErrorTestData];

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      business_formation_location_question: {
        submit: {
          location_entered_for_first_time: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<BusinessFormationPaginator />", () => {
  let initialUserData: UserData;
  let displayContent: TasksDisplayContent;

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();

    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    displayContent = {
      formationDbaContent: generateFormationDbaContent({}),
    };
    initialUserData = generateUserData({ profileData, formationData });
  });

  describe("button text", () => {
    it("shows unique text on button on first step", () => {
      preparePage(initialUserData, displayContent);
      expect(screen.getByText(Config.formation.general.initialNextButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.general.nextButtonText)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));
      expect(screen.queryByText(Config.formation.general.initialNextButtonText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.formation.general.nextButtonText)).toBeInTheDocument();
    });

    it("does not show previous button on first step", () => {
      preparePage(initialUserData, displayContent);
      expect(screen.queryByText(Config.formation.general.previousButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));
      expect(screen.getByText(Config.formation.general.previousButtonText)).toBeInTheDocument();
    });

    it("shows unique text on last step button", () => {
      const page = preparePage(initialUserData, displayContent);
      page.stepperClickToReviewStep();
      expect(screen.getByText(Config.formation.general.submitButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.general.nextButtonText)).not.toBeInTheDocument();
    });
  });

  describe("when in guest mode", () => {
    const guestModeNextButtonText = `Register & ${Config.formation.general.initialNextButtonText}`;
    let setRegistrationModalIsVisible: jest.Mock;

    beforeEach(() => {
      setRegistrationModalIsVisible = jest.fn();
    });

    const renderAsGuest = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
              <BusinessFormation task={generateTask({})} displayContent={displayContent} />
            </MunicipalitiesContext.Provider>
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { registrationModalIsVisible: false, setRegistrationModalIsVisible }
        )
      );
    };

    it("prepends register to the next button on first step", async () => {
      renderAsGuest();
      expect(screen.getByText(guestModeNextButtonText)).toBeInTheDocument();
    });

    it("shows registration modal when clicking continue button from step one", () => {
      renderAsGuest();
      fireEvent.click(screen.getByText(guestModeNextButtonText));
      expect(setRegistrationModalIsVisible).toHaveBeenCalled();
      expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
    });

    it("shows registration modal when clicking a step in the stepper", () => {
      renderAsGuest();
      fireEvent.click(screen.getByTestId(`stepper-1`));
      expect(setRegistrationModalIsVisible).toHaveBeenCalled();
      expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
    });
  });

  describe("when switching steps and user has not yet submitted", () => {
    it("displays dependency alert on first step only", async () => {
      const page = preparePage(initialUserData, displayContent);
      expect(screen.getByTestId("dependency-alert")).toBeInTheDocument();
      await page.stepperClickToBusinessStep();
      expect(screen.queryByTestId("dependency-alert")).not.toBeInTheDocument();
    });

    it("switches steps when clicking the stepper", async () => {
      const page = preparePage(initialUserData, displayContent);
      await page.stepperClickToContactsStep();
      await page.stepperClickToBusinessStep();
      await page.stepperClickToReviewStep();
      await page.stepperClickToBusinessNameStep();
      await page.stepperClickToBillingStep();
      expect(screen.getByTestId("billing-step")).toBeInTheDocument();
    });

    it("switches steps when clicking the next and previous buttons", async () => {
      const page = preparePage(initialUserData, displayContent);
      await page.submitBusinessNameStep();
      await page.submitBusinessStep();
      await page.submitContactsStep();
      await page.submitBillingStep();
      fireEvent.click(screen.getByText(Config.formation.general.previousButtonText));
      await waitFor(() => {
        expect(screen.getByTestId("billing-step")).toBeInTheDocument();
      });
    });

    const switchingStepTests = (switchStepFunction: () => void) => {
      it("filters out empty provisions", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBusinessStep();

        fireEvent.click(screen.getByText(Config.formation.fields.provisions.addButtonText));
        fireEvent.click(screen.getByText(Config.formation.fields.provisions.addAnotherButtonText));
        fireEvent.click(screen.getByText(Config.formation.fields.provisions.addAnotherButtonText));
        page.fillText("Provisions 2", "provision2");
        switchStepFunction();
        expect(currentUserData().formationData.formationFormData.provisions).toEqual(["provision2"]);
        await page.stepperClickToBusinessStep();
        expect(screen.getByLabelText("remove provision")).toBeInTheDocument();
      });

      describe("business name step", () => {
        it("saves name to formation data", async () => {
          const page = preparePage(initialUserData, displayContent);
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          switchStepFunction();
          expect(currentUserData().formationData.formationFormData.businessName).toEqual("Pizza Joint");

          await page.stepperClickToBusinessNameStep();
          expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
            "Pizza Joint"
          );
        });

        it("does not save availablity state when switching back to step", async () => {
          const page = preparePage(initialUserData, displayContent);
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          expect(screen.getByTestId("available-text")).toBeInTheDocument();

          switchStepFunction();
          await page.stepperClickToBusinessNameStep();
          expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
        });

        it("saves name to profile when available", async () => {
          const page = preparePage(initialUserData, displayContent);
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          switchStepFunction();
          expect(currentUserData().profileData.businessName).toEqual("Pizza Joint");
        });

        it("does not save name to profile when unavailable", async () => {
          const page = preparePage(initialUserData, displayContent);
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint");
          await page.searchBusinessName({ status: "UNAVAILABLE" });
          switchStepFunction();
          expect(currentUserData().profileData.businessName).toEqual(
            initialUserData.profileData.businessName
          );
        });

        it("does not save name to profile when error", async () => {
          const page = preparePage(initialUserData, displayContent);
          await page.stepperClickToBusinessNameStep();
          page.fillText("Search business name", "Pizza Joint LLC");
          await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
          switchStepFunction();
          expect(currentUserData().profileData.businessName).toEqual(
            initialUserData.profileData.businessName
          );
        });
      });

      describe("business step", () => {
        it("saves municipality to profile", async () => {
          const userDataWithMunicipality = {
            ...initialUserData,
            profileData: {
              ...initialUserData.profileData,
              municipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
            },
          };
          const page = preparePage(userDataWithMunicipality, displayContent, [
            generateMunicipality({ displayName: "New Town", name: "New Town" }),
          ]);
          await page.stepperClickToBusinessStep();

          expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual("Newark");
          page.selectByText("Address municipality", "New Town");
          expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual(
            "New Town"
          );
          switchStepFunction();
          await waitFor(() => {
            expect(currentUserData().profileData.municipality?.displayName).toEqual("New Town");
          });
          expect(currentUserData().formationData.formationFormData.addressMunicipality?.displayName).toEqual(
            "New Town"
          );
        });

        it("send analytics when municipality entered for first time", async () => {
          const newTownMuncipality = generateMunicipality({ displayName: "New Town" });

          const userDataWithMunicipality = {
            ...initialUserData,
            profileData: {
              ...initialUserData.profileData,
              municipality: undefined,
            },
          };

          const page = preparePage(userDataWithMunicipality, displayContent, [newTownMuncipality]);
          await page.stepperClickToBusinessStep();
          fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
          page.selectByText("Address municipality", "New Town");

          switchStepFunction();
          await waitFor(() => {
            expect(currentUserData().profileData.municipality?.displayName).toEqual("New Town");
          });

          expect(
            mockAnalytics.event.business_formation_location_question.submit.location_entered_for_first_time
          ).toHaveBeenCalled();
        });

        it("does not send analytics when municipality was already entered", async () => {
          const userDataWithMunicipality = {
            ...initialUserData,
            profileData: {
              ...initialUserData.profileData,
              municipality: generateMunicipality({ displayName: "Newark" }),
            },
          };

          const page = preparePage(userDataWithMunicipality, displayContent, [
            generateMunicipality({ displayName: "New Town" }),
          ]);
          await page.stepperClickToBusinessStep();
          page.selectByText("Address municipality", "New Town");

          switchStepFunction();
          await waitFor(() => {
            expect(currentUserData().profileData.municipality?.displayName).toEqual("New Town");
          });

          expect(
            mockAnalytics.event.business_formation_location_question.submit.location_entered_for_first_time
          ).not.toHaveBeenCalled();
        });
      });

      it("marks a step incomplete in the stepper when moving from it if required fields are missing", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBillingStep();
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("INCOMPLETE");
      });

      it("marks a step as complete in the stepper if all required fields completed", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();

        switchStepFunction();
        await waitFor(() => {
          expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE");
        });
      });

      it("marks step one as complete if business name is available", async () => {
        const page = preparePage(initialUserData, displayContent);
        page.fillText("Search business name", "Pizza Joint");
        await page.searchBusinessName({ status: "AVAILABLE" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("COMPLETE");
      });

      it("marks step one as incomplete if business name is unavailable", async () => {
        const page = preparePage(initialUserData, displayContent);
        page.fillText("Search business name", "Pizza Joint");
        await page.searchBusinessName({ status: "UNAVAILABLE" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("INCOMPLETE");
      });

      it("marks step one as incomplete if business name search is error", async () => {
        const page = preparePage(initialUserData, displayContent);
        page.fillText("Search business name", "Pizza Joint LLC");
        await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("INCOMPLETE");
      });

      it("shows existing inline errors when visiting an INCOMPLETE step with inline errors", async () => {
        const page = preparePage(initialUserData, displayContent);
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
        const page = preparePage(initialUserData, displayContent);
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

      it("shows error field states for each step with error", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBusinessNameStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        await page.stepperClickToBusinessStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        await page.stepperClickToContactsStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
        await page.stepperClickToBillingStep();
        expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
      });

      it("updates stepper to show error state if user changes a COMPLETE step", async () => {
        const page = preparePage(initialUserData, displayContent);
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
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBillingStep();
        expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();

        page.completeRequiredBillingFields();
        expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE-ACTIVE");
      });
    });

    describe("no validation errors", () => {
      let filledInUserData: UserData;

      beforeEach(() => {
        filledInUserData = {
          ...initialUserData,
          formationData: {
            ...initialUserData.formationData,
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

        const page = preparePage(filledInUserData, displayContent);
        await page.fillAndSubmitBusinessNameStep();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();
        await waitFor(() => {
          return expect(mockPush).toHaveBeenCalledWith("www.example.com");
        });
      });

      describe("on known API error", () => {
        describe("starting business persona", () => {
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
          const agentOfficeAddressMunicipality: MockApiErrorJestArray = [
            "agentOfficeAddressMunicipality",
            {
              formationFormData: generateFormationFormData(
                {
                  agentNumberOrManual: "MANUAL_ENTRY",
                  agentOfficeAddressMunicipality: generateMunicipality({ displayName: "Newark" }),
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
              fieldName: "agentOfficeAddressMunicipality",
              fieldLabel: "Agent office address municipality",
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
              radioBtnText: "Pay with E-Check",
            },
          ];

          it.each([
            businessSuffix,
            businessStartDate,
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressMunicipality,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
            paymentType,
          ])(
            "shows error alert and error state on step associated with %o API error",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName } = data;

              filledInUserData = {
                ...initialUserData,
                formationData: {
                  ...initialUserData.formationData,
                  formationFormData: formationFormData,
                  formationResponse: formationResponse,
                },
              };
              const page = preparePage(filledInUserData, displayContent);
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
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressMunicipality,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
            paymentType,
          ])("shows API error message on step for %o API error", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldName } = data;
            filledInUserData = {
              ...initialUserData,
              formationData: {
                ...initialUserData.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage(filledInUserData, displayContent);
            await page.fillAndSubmitBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();

            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();

            expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.errorBanner.errorOnStep);
            expect(screen.getByRole("alert")).toHaveTextContent(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (Config.formation.fields as any)[fieldName as string].label
            );
            expect(screen.getByRole("alert")).toHaveTextContent("very bad input");
          });

          it.each([
            agentNumber,
            agentName,
            agentEmail,
            agentOfficeAddressLine1,
            agentOfficeAddressLine2,
            agentOfficeAddressMunicipality,
            agentOfficeAddressZipCode,
            contactFirstName,
            contactLastName,
            contactPhoneNumber,
          ])("removes %o API error on blur when user changes text field", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldLabel, newTextInput } =
              data;
            filledInUserData = {
              ...initialUserData,
              formationData: {
                ...initialUserData.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage(filledInUserData, displayContent);
            await page.fillAndSubmitBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByRole("alert")).toBeInTheDocument();
            page.fillText(fieldLabel as string as string, newTextInput as string);
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
              "COMPLETE-ACTIVE"
            );
          });

          it.each([paymentType])(
            "removes %o API error when user selects radio button",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName, radioBtnText } = data;
              filledInUserData = {
                ...initialUserData,
                formationData: {
                  ...initialUserData.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage(filledInUserData, displayContent);
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Billing") await page.stepperClickToBillingStep();
              expect(screen.getByRole("alert")).toBeInTheDocument();
              fireEvent.click(screen.getByText(radioBtnText as string));
              expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
              filledInUserData = {
                ...initialUserData,
                formationData: {
                  ...initialUserData.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage(filledInUserData, displayContent);
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Business") await page.stepperClickToBusinessStep();
              expect(screen.getByRole("alert")).toBeInTheDocument();

              page.selectByText(dropDownLabel as string, dropDownValue as string);
              fireEvent.focusOut(screen.getAllByLabelText(dropDownLabel as string)[0]);

              expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
              filledInUserData = {
                ...initialUserData,
                formationData: {
                  ...initialUserData.formationData,
                  formationFormData,
                  formationResponse,
                },
              };
              const page = preparePage(filledInUserData, displayContent);
              await page.fillAndSubmitBusinessNameStep();
              await page.stepperClickToReviewStep();
              await page.clickSubmit();
              if (formationStepName === "Business") await page.stepperClickToBusinessStep();
              expect(screen.getByRole("alert")).toBeInTheDocument();

              page.selectDate(
                newDate as DateObject,
                datePickerFieldType as "Business start date" | "Foreign date of formation"
              );

              expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
          ])(
            "shows error alert and error state on step associated with %o API error",
            async (testTitle, data) => {
              const { formationFormData, formationResponse, formationStepName } = data;

              filledInUserData = {
                ...initialUserData,
                profileData: { ...initialUserData.profileData, businessPersona: "FOREIGN" },
                formationData: {
                  ...initialUserData.formationData,
                  formationFormData: formationFormData,
                  formationResponse: formationResponse,
                },
              };
              const page = preparePage(filledInUserData, displayContent);
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
          ])("shows API error message on step for %o API error", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldName } = data;
            filledInUserData = {
              ...initialUserData,
              profileData: { ...initialUserData.profileData, businessPersona: "FOREIGN" },
              formationData: {
                ...initialUserData.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage(filledInUserData, displayContent);
            await page.fillAndSubmitNexusBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.errorBanner.errorOnStep);
            expect(screen.getByRole("alert")).toHaveTextContent(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (Config.formation.fields as any)[fieldName as string].label
            );
            expect(screen.getByRole("alert")).toHaveTextContent("very bad input");
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
          ])("removes %o API error on blur when user changes text field", async (testTitle, data) => {
            const { formationFormData, formationResponse, formationStepName, fieldLabel, newTextInput } =
              data;
            filledInUserData = {
              ...initialUserData,
              profileData: { ...initialUserData.profileData, businessPersona: "FOREIGN" },
              formationData: {
                ...initialUserData.formationData,
                formationFormData,
                formationResponse,
              },
            };
            const page = preparePage(filledInUserData, displayContent);
            await page.fillAndSubmitNexusBusinessNameStep();
            await page.stepperClickToReviewStep();
            await page.clickSubmit();
            if (formationStepName === "Business") await page.stepperClickToBusinessStep();
            if (formationStepName === "Contacts") await page.stepperClickToContactsStep();
            if (formationStepName === "Billing") await page.stepperClickToBillingStep();
            expect(screen.getByRole("alert")).toBeInTheDocument();

            page.fillText(fieldLabel as string as string, newTextInput as string);
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(screen.queryByText(Config.formation.errorBanner.errorOnStep)).not.toBeInTheDocument();
            expect(page.getStepStateInStepper(LookupStepIndexByName(formationStepName))).toEqual(
              "COMPLETE-ACTIVE"
            );
          });
        });
      });

      describe("on unknown API error (generic)", () => {
        beforeEach(() => {
          filledInUserData = {
            ...initialUserData,
            formationData: {
              ...initialUserData.formationData,
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
          const page = preparePage(filledInUserData, displayContent);
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
          const page = preparePage(filledInUserData, displayContent);
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
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("autosaves every second if a field has changed", async () => {
      const page = preparePage(initialUserData, displayContent);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      page.fillText("Search business name", "Pizza Joint");
      await waitFor(() =>
        expect(currentUserData().formationData.formationFormData.businessName).toEqual("Pizza Joint")
      );
    });

    it("does not autosave if fields have not changed", () => {
      preparePage(initialUserData, displayContent);
      expect(userDataUpdatedNTimes()).toEqual(1);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(userDataUpdatedNTimes()).toEqual(1);
    });

    it("does not filter user data when autosaving, only when switching steps", async () => {
      const page = preparePage(initialUserData, displayContent);
      await page.stepperClickToBusinessStep();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      fireEvent.click(screen.getByText(Config.formation.fields.provisions.addButtonText));

      await waitFor(() => expect(currentUserData().formationData.formationFormData.provisions).toEqual([""]));
      await page.stepperClickToContactsStep();
      await page.stepperClickToBusinessStep();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([]);
    });

    it("does not autosave if a field has changed but less than 1 second has passed", () => {
      const page = preparePage(initialUserData, displayContent);
      expect(userDataUpdatedNTimes()).toEqual(1);
      makeChangeToForm(page);
      act(() => {
        jest.advanceTimersByTime(900);
      });
      expect(userDataUpdatedNTimes()).toEqual(1);
    });

    it("displays the saving spinner every 1 min, for 2.5 seconds at a time", async () => {
      const page = preparePage(initialUserData, displayContent);
      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      makeChangeToForm(page);
      await waitFor(() =>
        expect(currentUserData().formationData.formationFormData.businessName).toEqual("Pizza Joint")
      );

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(59000);
      });

      expect(screen.getByText(Config.autosaveDefaults.savingText)).toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.autosaveDefaults.savedText)).toBeInTheDocument();
    });

    it("does not display the saving spinner if no saves occurred in that 1 min", async () => {
      const page = preparePage(initialUserData, displayContent);

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      makeChangeToForm(page);
      act(() => {
        jest.advanceTimersByTime(59000);
      });
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.autosaveDefaults.savedText)).toBeInTheDocument();

      act(() => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.queryByText(Config.autosaveDefaults.savingText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.autosaveDefaults.savedText)).not.toBeInTheDocument();
    });

    const makeChangeToForm = (page: FormationPageHelpers) => {
      page.fillText("Search business name", "Pizza Joint");
    };
  });
});
