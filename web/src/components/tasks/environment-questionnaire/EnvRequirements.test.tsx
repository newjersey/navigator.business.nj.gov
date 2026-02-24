import { EnvRequirements } from "@/components/tasks/environment-questionnaire/EnvRequirements";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { EnvironmentData } from "@businessnjgovnavigator/shared/environment";
import {
  generateBusiness,
  generateEnvironmentData,
  generateEnvironmentQuestionnaireData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test/factories";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

jest.mock("@/lib/api-client/apiClient", () => ({ sendEnvironmentPermitEmail: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("<EnvRequirements />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const setShowNeedsAccountModal = jest.fn();
  const setShowContinueWithoutSaving = jest.fn();
  const existingEmail = "emailInUserData@email.com";

  const renderComponent = (environmentData?: Partial<EnvironmentData>): void => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        environmentData: generateEnvironmentData({ ...environmentData }),
      }),
    );
    const userDataWithEmail: UserData = {
      ...userData,
      user: {
        ...userData.user,
        email: existingEmail,
      },
    };

    render(
      <WithStatefulUserData initialUserData={userDataWithEmail}>
        <EnvRequirements task={generateTask({})} />
      </WithStatefulUserData>,
    );
  };

  const renderComponentWithNeedsAccountContext = ({
    isAuthenticated,
    userWantsToContinueWithoutSaving,
  }: {
    isAuthenticated?: boolean;
    userWantsToContinueWithoutSaving?: boolean;
  }): void => {
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness({}))}>
          <EnvRequirements task={generateTask({})} />
        </WithStatefulUserData>,
        isAuthenticated ? IsAuthenticated.TRUE : IsAuthenticated.FALSE,
        {
          setShowNeedsAccountModal: setShowNeedsAccountModal,
          setShowContinueWithoutSaving: setShowContinueWithoutSaving,
          userWantsToContinueWithoutSaving: userWantsToContinueWithoutSaving ?? false,
        },
      ),
    );
  };

  describe("questionnaire", () => {
    describe("Needs Account modal", () => {
      it("opens 'Needs Account' modal when the stepper is clicked and updates step", async () => {
        renderComponentWithNeedsAccountContext({});
        fireEvent.click(screen.getByTestId(`stepper-1`));
        await waitFor(() => {
          return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
        });
        expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
      });

      it("opens 'Needs Account' modal when the start button is clicked and updates step", async () => {
        renderComponentWithNeedsAccountContext({});
        startQuestionnaire();
        await waitFor(() => {
          return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
        });
        expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
      });

      it("sets returnToLink on 'Needs Account Modal' opening", async () => {
        renderComponentWithNeedsAccountContext({});
        startQuestionnaire();
        await waitFor(() => {
          return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
        });
        expect(currentBusiness().preferences.returnToLink).toEqual(ROUTES.environmentRequirements);
      });

      it("sets showContinueWithoutSaving to true when on the first step, is not authenticated and user hasn't clicked continue without saving", async () => {
        renderComponentWithNeedsAccountContext({});
        startQuestionnaire();
        await waitFor(() => {
          return expect(setShowContinueWithoutSaving).toHaveBeenCalledWith(true);
        });
      });

      it("doesn't open 'Needs Account' modal when continueWithoutSaving is true", async () => {
        renderComponentWithNeedsAccountContext({ userWantsToContinueWithoutSaving: true });
        startQuestionnaire();
        await waitFor(() => {
          return expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
        });
      });
    });

    it.each([
      ["air", 1],
      ["land", 2],
      ["waste", 3],
      ["drinkingWater", 4],
      ["wasteWater", 5],
    ])("renders the %s step", async (mediaArea, stepIndex) => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`stepper-${stepIndex}`));
      await waitFor(() => {
        expect(screen.getByTestId(`${mediaArea}-questionnaire`)).toBeInTheDocument();
      });
    });

    it("steps forward in the questionnaire when Save and Continue is clicked", async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`stepper-1`));
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
      goToNextStep();
      expect(screen.queryByTestId(`air-questionnaire`)).not.toBeInTheDocument();
      expect(screen.getByTestId(`land-questionnaire`)).toBeInTheDocument();
    });

    it("steps backward in the questionnaire when Back is clicked", async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`stepper-2`));
      expect(screen.getByTestId(`land-questionnaire`)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.envQuestionPage.generic.backButtonText));
      expect(screen.queryByTestId(`land-questionnaire`)).not.toBeInTheDocument();
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
    });

    it("throws an error if nothing is selected and navigates to step one", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`stepper-5`));
      saveAndSeeResults();
      expect(screen.getByTestId("stepper-error-alert")).toBeInTheDocument();
      expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
    });

    it("navigates to the appropriate step when the step is clicked within the error alert", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`stepper-5`));
      saveAndSeeResults();
      const errorAlert = screen.getByTestId("stepper-error-alert");
      expect(errorAlert).toBeInTheDocument();

      fireEvent.click(within(errorAlert).getByText("Air"));
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();

      fireEvent.click(within(errorAlert).getByText("Waste"));
      expect(screen.getByTestId(`waste-questionnaire`)).toBeInTheDocument();
    });

    it("saves the questionnaire data when the Save and Continue button is clicked on the final page", () => {
      renderComponent();
      startQuestionnaire();
      fireEvent.click(screen.getByTestId("constructionActivities"));
      goToNextStep();
      fireEvent.click(screen.getByTestId("propertyAssessment"));
      goToNextStep();
      fireEvent.click(screen.getByTestId("compostWaste"));
      goToNextStep();
      fireEvent.click(screen.getByTestId("combinedWellCapacity"));
      goToNextStep();
      fireEvent.click(screen.getByTestId("localSewage"));
      saveAndSeeResults();
      expect(currentBusiness().environmentData?.submitted).toBe(true);
      const updatedQuestionnaireData = generateEnvironmentQuestionnaireData({
        airOverrides: { constructionActivities: true },
        landOverrides: { propertyAssessment: true },
        wasteOverrides: { compostWaste: true },
        drinkingWaterOverrides: { combinedWellCapacity: true },
        wasteWaterOverrides: { localSewage: true },
      });
      expect(currentBusiness().environmentData?.questionnaireData).toEqual(
        updatedQuestionnaireData,
      );
      expect(currentBusiness().environmentData?.submitted).toBe(true);
    });

    it("clears everything if 'none of the above' is selected", () => {
      renderComponent({
        questionnaireData: generateEnvironmentQuestionnaireData({
          airOverrides: { constructionActivities: true },
          landOverrides: { propertyAssessment: true },
          wasteOverrides: { compostWaste: true },
          drinkingWaterOverrides: { combinedWellCapacity: true },
          wasteWaterOverrides: { localSewage: true },
        }),
        submitted: false,
      });
      startQuestionnaire();
      expect(getCheckBoxByTestId("constructionActivities")).toBeChecked();
      fireEvent.click(screen.getByTestId("noAir"));
      expect(getCheckBoxByTestId("noAir")).toBeChecked();
      expect(getCheckBoxByTestId("constructionActivities")).not.toBeChecked();
    });

    it("clears 'none of the above' if something else is selected", () => {
      renderComponent({
        questionnaireData: generateEnvironmentQuestionnaireData({
          airOverrides: { noAir: true },
          landOverrides: { propertyAssessment: true },
          wasteOverrides: { compostWaste: true },
          drinkingWaterOverrides: { combinedWellCapacity: true },
          wasteWaterOverrides: { localSewage: true },
        }),
        submitted: false,
      });
      startQuestionnaire();
      expect(getCheckBoxByTestId("noAir")).toBeChecked();
      fireEvent.click(screen.getByTestId("constructionActivities"));
      expect(getCheckBoxByTestId("constructionActivities")).toBeChecked();
      expect(getCheckBoxByTestId("noAir")).not.toBeChecked();
    });
  });

  describe("results", () => {
    describe("applicable", () => {
      const submittedQuestionnaire = {
        submitted: true,
        questionnaireData: generateEnvironmentQuestionnaireData({
          airOverrides: { constructionActivities: true },
          landOverrides: { noLand: true },
          wasteOverrides: { noWaste: true },
          drinkingWaterOverrides: { combinedWellCapacity: true },
          wasteWaterOverrides: { localSewage: true },
        }),
      };

      describe("personalized support", () => {
        it("pre-populates the email from user data", async () => {
          renderComponent(submittedQuestionnaire);
          expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
          fireEvent.click(screen.getByText(Config.envResultsPage.personalizedSupport.title));
          const emailField = screen.getByLabelText("Email Address");
          expect(emailField).toHaveValue(existingEmail);
        });

        it("submits an email request when submit is clicked and updates userData", async () => {
          mockApi.sendEnvironmentPermitEmail.mockResolvedValue("SUCCESS");
          renderComponent(submittedQuestionnaire);
          fireEvent.click(screen.getByText(Config.envResultsPage.personalizedSupport.title));
          fireEvent.click(
            screen.getByText(Config.envResultsPage.personalizedSupport.contactSbapButton),
          );
          await waitFor(() =>
            expect(mockApi.sendEnvironmentPermitEmail).toHaveBeenCalledWith({
              businessName: currentBusiness().profileData.businessName,
              email: currentUserData().user.email,
              industry: currentBusiness().profileData.industryId,
              location: "N/A",
              naicsCode: currentBusiness().profileData.naicsCode,
              phase: currentBusiness().profileData.businessPersona,
              questionnaireResponses:
                "<ul><li>Air Requirements</li><ul><li>My business plans to conduct construction activities (crushers, conveyors, shredders, stationary engines, or equipment that generate dust).</li></ul><li>Drinking Water Requirements</li><ul><li>My business will have a combined well pump capacity of greater than 69 gallons per minute.</li></ul><li>Wastewater Requirements</li><ul><li>My business will release wastewater to a local sewage treatment plant.</li></ul></ul>",
              userName: currentUserData().user.name,
            }),
          );
          expect(currentBusiness().environmentData?.sbapEmailSent).toBe(true);
        });

        it("submits an email request with N/A for fields that are empty when submit is clicked", async () => {
          mockApi.sendEnvironmentPermitEmail.mockResolvedValue("SUCCESS");
          const userData = generateUserDataForBusiness(
            generateBusiness({
              environmentData: generateEnvironmentData({ ...submittedQuestionnaire }),
              profileData: generateProfileData({
                businessName: "",
                naicsCode: "",
              }),
            }),
          );
          render(
            <WithStatefulUserData initialUserData={userData}>
              <EnvRequirements task={generateTask({})} />
            </WithStatefulUserData>,
          );
          fireEvent.click(screen.getByText(Config.envResultsPage.personalizedSupport.title));
          fireEvent.click(
            screen.getByText(Config.envResultsPage.personalizedSupport.contactSbapButton),
          );
          await waitFor(() =>
            expect(mockApi.sendEnvironmentPermitEmail).toHaveBeenCalledWith({
              businessName: "N/A",
              email: currentUserData().user.email,
              industry: currentBusiness().profileData.industryId,
              location: "N/A",
              naicsCode: "N/A",
              phase: currentBusiness().profileData.businessPersona,
              questionnaireResponses:
                "<ul><li>Air Requirements</li><ul><li>My business plans to conduct construction activities (crushers, conveyors, shredders, stationary engines, or equipment that generate dust).</li></ul><li>Drinking Water Requirements</li><ul><li>My business will have a combined well pump capacity of greater than 69 gallons per minute.</li></ul><li>Wastewater Requirements</li><ul><li>My business will release wastewater to a local sewage treatment plant.</li></ul></ul>",
              userName: currentUserData().user.name,
            }),
          );
        });

        it("displays an error when the email is invalid", async () => {
          renderComponent(submittedQuestionnaire);
          fireEvent.click(screen.getByText(Config.envResultsPage.personalizedSupport.title));
          const emailField = screen.getByLabelText("Email Address");
          fireEvent.change(emailField, { target: { value: "badEmail" } });
          fireEvent.click(
            screen.getByText(Config.envResultsPage.personalizedSupport.contactSbapButton),
          );
          await waitFor(() => expect(mockApi.sendEnvironmentPermitEmail).not.toHaveBeenCalled());
          expect(screen.getByTestId("email-error-alert")).toBeInTheDocument();
        });
      });

      it("displays only the applicable contact cards", async () => {
        renderComponent(submittedQuestionnaire);
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.contactDep.title));
        expect(screen.getByTestId("contact-air")).toBeInTheDocument();
        expect(screen.queryByTestId("contact-land")).not.toBeInTheDocument();
        expect(screen.queryByTestId("contact-waste")).not.toBeInTheDocument();
        expect(screen.getByTestId("contact-drinkingWater")).toBeInTheDocument();
        expect(screen.getByTestId("contact-wasteWater")).toBeInTheDocument();
      });

      it("displays only the applicable responses", async () => {
        renderComponent(submittedQuestionnaire);
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.seeYourResponses.title));
        expect(screen.getByTestId("air-responses")).toBeInTheDocument();
        expect(screen.queryByTestId("land-responses")).not.toBeInTheDocument();
        expect(screen.queryByTestId("waste-responses")).not.toBeInTheDocument();
        expect(screen.getByTestId("drinkingWater-responses")).toBeInTheDocument();
        expect(screen.getByTestId("wasteWater-responses")).toBeInTheDocument();
      });

      it("only shows the applicable media areas in the description", () => {
        renderComponent(submittedQuestionnaire);
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.air}, ${Config.envResultsPage.summary.mediaAreaText.drinkingWater}, and ${Config.envResultsPage.summary.mediaAreaText.wasteWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("displays the media areas joined by an 'and' in the description when only two media areas are applicable", () => {
        const envDataWithTwoApplicableMediaArea = {
          submitted: true,
          questionnaireData: generateEnvironmentQuestionnaireData({
            airOverrides: { constructionActivities: true },
            drinkingWaterOverrides: { combinedWellCapacity: true },
          }),
        };

        renderComponent(envDataWithTwoApplicableMediaArea);
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.air} and ${Config.envResultsPage.summary.mediaAreaText.drinkingWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("displays a single media area in the description when only one is applicable", () => {
        const envDataWithOneApplicableMediaArea = {
          submitted: true,
          questionnaireData: generateEnvironmentQuestionnaireData({
            drinkingWaterOverrides: { combinedWellCapacity: true },
          }),
        };
        renderComponent(envDataWithOneApplicableMediaArea);
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.drinkingWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("takes the user back to step 0 when the Edit button is clicked", () => {
        renderComponent(submittedQuestionnaire);
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.editText));
        expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
      });
    });

    describe("not applicable", () => {
      const envDataWithNotApplicableSubmittedQuestionnaire = {
        submitted: true,
        questionnaireData: generateEnvironmentQuestionnaireData({
          airOverrides: { noAir: true },
          landOverrides: { noLand: true },
          wasteOverrides: { noWaste: true },
          drinkingWaterOverrides: { noDrinkingWater: true },
          wasteWaterOverrides: { noWasteWater: true },
        }),
      };

      it("shows the low applicablity summary page", () => {
        renderComponent(envDataWithNotApplicableSubmittedQuestionnaire);
        expect(
          screen.getByText(Config.envResultsPage.lowApplicability.summaryLineOne),
        ).toBeInTheDocument();
      });

      it("takes the user back to step zero when the Edit button is clicked", () => {
        renderComponent(envDataWithNotApplicableSubmittedQuestionnaire);
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.editText));
        expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
      });

      it("takes the user back to step zero when 'redo this form' is clicked", () => {
        renderComponent(envDataWithNotApplicableSubmittedQuestionnaire);
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.lowApplicability.calloutRedo));
        expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
      });
    });
  });
});

const goToNextStep = (): void => {
  fireEvent.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
};

const saveAndSeeResults = (): void => {
  fireEvent.click(screen.getByText(Config.envQuestionPage.generic.endingButtonText));
};

const startQuestionnaire = (): void => {
  fireEvent.click(screen.getByText(Config.envQuestionPage.generic.startingButtonText));
};

const getCheckBoxByTestId = (testId: string): HTMLInputElement => {
  return within(screen.getByTestId(testId) as HTMLInputElement).getByRole("checkbox");
};
