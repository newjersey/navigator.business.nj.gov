import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { FormationDisplayContentMap } from "@/lib/types/types";
import {
  generateEmptyFormationData,
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateMunicipality,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import {
  generateFormationProfileData,
  mockApiResponse,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { mockPush } from "@/test/mock/mockRouter";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("<BusinessFormationPaginator />", () => {
  let initialUserData: UserData;
  let displayContent: FormationDisplayContentMap;

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();

    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    displayContent = generateFormationDisplayContent({});
    initialUserData = generateUserData({ profileData, formationData });
  });

  describe("buttons", () => {
    it("shows unique text on button on first step", () => {
      preparePage(initialUserData, displayContent);
      expect(screen.getByText(Config.businessFormationDefaults.initialNextButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.businessFormationDefaults.nextButtonText)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));
      expect(
        screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByText(Config.businessFormationDefaults.nextButtonText)).toBeInTheDocument();
    });

    it("does not show previous button on first step", () => {
      preparePage(initialUserData, displayContent);
      expect(screen.queryByText(Config.businessFormationDefaults.nextButtonText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));
      expect(screen.getByText(Config.businessFormationDefaults.previousButtonText)).toBeInTheDocument();
    });

    it("shows unique text on last step button", () => {
      const page = preparePage(initialUserData, displayContent);
      page.stepperClickToReviewStep();
      expect(screen.getByText(Config.businessFormationDefaults.submitButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.businessFormationDefaults.nextButtonText)).not.toBeInTheDocument();
    });
  });

  describe("when in guest mode", () => {
    const guestModeNextButtonText = `Register & ${Config.businessFormationDefaults.initialNextButtonText}`;
    let setModalIsVisible: jest.Mock;

    beforeEach(() => {
      setModalIsVisible = jest.fn();
    });

    const renderAsGuest = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <BusinessFormation task={generateTask({})} displayContent={displayContent} municipalities={[]} />
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { modalIsVisible: false, setModalIsVisible }
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
      expect(setModalIsVisible).toHaveBeenCalled();
      expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
    });

    it("shows registration modal when clicking a step in the stepper", () => {
      renderAsGuest();
      fireEvent.click(screen.getByTestId(`stepper-1`));
      expect(setModalIsVisible).toHaveBeenCalled();
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
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
      await waitFor(() => {
        expect(screen.getByTestId("billing-step")).toBeInTheDocument();
      });
    });

    const switchingStepTests = (switchStepFunction: () => void) => {
      it("filters out empty provisions", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBusinessStep();

        fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
        fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
        fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
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
          await page.searchBusinessName({ status: "DESIGNATOR" });
          switchStepFunction();
          expect(currentUserData().profileData.businessName).toEqual(
            initialUserData.profileData.businessName
          );
        });
      });

      describe("business step", () => {
        it("saves municipality to profile", async () => {
          const municipality = generateMunicipality({ displayName: "New Town" });
          const userDataWithMunicipality = {
            ...initialUserData,
            profileData: {
              ...initialUserData.profileData,
              municipality: generateMunicipality({ displayName: "Newark" }),
            },
          };
          const page = preparePage(userDataWithMunicipality, displayContent, [municipality]);
          await page.stepperClickToBusinessStep();

          expect((screen.getByLabelText("Business address city") as HTMLInputElement).value).toEqual(
            "Newark"
          );
          page.selectByText("Business address city", "New Town");
          expect((screen.getByLabelText("Business address city") as HTMLInputElement).value).toEqual(
            "New Town"
          );
          switchStepFunction();
          await waitFor(() => {
            expect(currentUserData().profileData.municipality?.displayName).toEqual("New Town");
          });
          expect(currentUserData().formationData.formationFormData.businessAddressCity?.displayName).toEqual(
            "New Town"
          );
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
        await page.searchBusinessName({ status: "DESIGNATOR" });
        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("INCOMPLETE");
      });

      it("shows existing inline errors when visiting an INCOMPLETE step with inline errors", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBusinessStep();
        page.fillText("Business address zip code", "22222");
        expect(
          screen.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();

        switchStepFunction();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("INCOMPLETE");

        await page.stepperClickToBusinessStep();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("INCOMPLETE-ACTIVE");
        expect(
          screen.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
        ).toBeInTheDocument();
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

        expect(
          screen.queryByText(Config.businessFormationDefaults.incompleteStepsOnSubmitText)
        ).not.toBeInTheDocument();
        await page.clickSubmit();

        expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Business"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Contacts"))).toEqual("ERROR");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("COMPLETE");
        expect(page.getStepStateInStepper(LookupStepIndexByName("Review"))).toEqual("INCOMPLETE-ACTIVE");

        expect(
          screen.getByText(Config.businessFormationDefaults.incompleteStepsOnSubmitText)
        ).toBeInTheDocument();
      });

      it("shows error field states for each step with error", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBusinessNameStep();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
        await page.stepperClickToBusinessStep();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
        await page.stepperClickToContactsStep();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
        await page.stepperClickToBillingStep();
        expect(
          screen.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).not.toBeInTheDocument();
      });

      it("updates stepper to show error state if user changes a COMPLETE step", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToBillingStep();
        page.completeRequiredBillingFields();
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBillingStep();

        expect(
          screen.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).not.toBeInTheDocument();
        page.fillText("Contact first name", "");

        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();
        expect(page.getStepStateInStepper(LookupStepIndexByName("Billing"))).toEqual("ERROR-ACTIVE");
      });

      it("updates stepper to show COMPLETE if user changes an ERROR step", async () => {
        const page = preparePage(initialUserData, displayContent);
        await page.stepperClickToReviewStep();
        await page.clickSubmit();

        await page.stepperClickToBillingStep();
        expect(
          screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).toBeInTheDocument();

        page.completeRequiredBillingFields();
        expect(
          screen.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
        ).not.toBeInTheDocument();
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
            formationFormData: generateFormationFormData({}, "limited-liability-company"),
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
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith("www.example.com"));
      });

      describe("on known API error (registered agent)", () => {
        beforeEach(() => {
          filledInUserData = {
            ...initialUserData,
            formationData: {
              ...initialUserData.formationData,
              formationFormData: generateFormationFormData(
                { agentNumberOrManual: "NUMBER", agentNumber: "1111111" },
                "limited-liability-company"
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
            },
          };
        });

        it("shows error alert and error state on step associated with API error", async () => {
          const page = preparePage(filledInUserData, displayContent);
          await page.fillAndSubmitBusinessNameStep();
          await page.stepperClickToReviewStep();
          await page.clickSubmit();
          expect(page.getStepStateInStepper(LookupStepIndexByName("Contacts"))).toEqual("ERROR");
          expect(
            screen.getByText(Config.businessFormationDefaults.incompleteStepsOnSubmitText)
          ).toBeInTheDocument();
        });

        it("shows API error message on step for error", async () => {
          const page = preparePage(filledInUserData, displayContent);
          await page.fillAndSubmitBusinessNameStep();
          await page.stepperClickToReviewStep();
          await page.clickSubmit();
          await page.stepperClickToContactsStep();
          expect(
            screen.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
          ).toBeInTheDocument();
          expect(
            screen.getByText(Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentNumber)
          ).toBeInTheDocument();
          expect(screen.getByText("very bad input")).toBeInTheDocument();
        });

        it("removes API error on blur when user changes field", async () => {
          const page = preparePage(filledInUserData, displayContent);
          await page.fillAndSubmitBusinessNameStep();
          await page.stepperClickToReviewStep();
          await page.clickSubmit();
          await page.stepperClickToContactsStep();
          page.fillText("Agent number", "1234567");

          expect(
            screen.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentNumber)
          ).not.toBeInTheDocument();
          expect(screen.queryByText("very bad input")).not.toBeInTheDocument();
          expect(page.getStepStateInStepper(LookupStepIndexByName("Contacts"))).toEqual("COMPLETE-ACTIVE");
        });
      });

      describe("on unknown API error (generic)", () => {
        beforeEach(() => {
          filledInUserData = {
            ...initialUserData,
            formationData: {
              ...initialUserData.formationData,
              formationFormData: generateFormationFormData({}, "limited-liability-company"),
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
});
