import { EnvPermit } from "@/components/tasks/environment-questionnaire/EnvPermit";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateEnvironmentQuestionnaireData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test/factories";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

describe("<CheckEnvPermits />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const setShowNeedsAccountModal = jest.fn();
  const setShowContinueWithoutSaving = jest.fn();

  describe("questionnaire", () => {
    it("opens 'Needs Account' modal when the stepper is clicked and updates step", async () => {
      render(
        withNeedsAccountContext(<EnvPermit task={generateTask({})} />, IsAuthenticated.FALSE, {
          setShowNeedsAccountModal: setShowNeedsAccountModal,
        }),
      );
      fireEvent.click(screen.getByTestId(`stepper-1`));
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
    });

    it("opens 'Needs Account' modal when the start button is clicked and updates step", async () => {
      render(
        withNeedsAccountContext(<EnvPermit task={generateTask({})} />, IsAuthenticated.FALSE, {
          setShowNeedsAccountModal: setShowNeedsAccountModal,
        }),
      );
      startQuestionnaire();
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
    });

    it("sets returnToLink on 'Needs Account Modal' opening", async () => {
      render(
        withNeedsAccountContext(
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness({}))}>
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          {
            setShowNeedsAccountModal: setShowNeedsAccountModal,
          },
        ),
      );
      startQuestionnaire();
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(currentBusiness().preferences.returnToLink).toEqual(ROUTES.envPermit);
    });

    it("sets showContinueWithoutSaving to true when on the first step, is not authenticated and user hasn't clicked continue without saving", async () => {
      render(
        withNeedsAccountContext(<EnvPermit task={generateTask({})} />, IsAuthenticated.FALSE, {
          setShowContinueWithoutSaving: setShowContinueWithoutSaving,
        }),
      );
      startQuestionnaire();
      await waitFor(() => {
        return expect(setShowContinueWithoutSaving).toHaveBeenCalledWith(true);
      });
    });

    it("doesn't open 'Needs Account' modal when continueWithoutSaving is true", async () => {
      render(
        withNeedsAccountContext(<EnvPermit task={generateTask({})} />, IsAuthenticated.FALSE, {
          userWantsToContinueWithoutSaving: true,
        }),
      );
      startQuestionnaire();
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
      });
    });

    it.each([
      ["air", 1],
      ["land", 2],
      ["waste", 3],
      ["drinkingWater", 4],
      ["wasteWater", 5],
    ])("renders the %s step", async (mediaArea, stepIndex) => {
      render(<EnvPermit task={generateTask({})} />);
      fireEvent.click(screen.getByTestId(`stepper-${stepIndex}`));
      await waitFor(() => {
        expect(screen.getByTestId(`${mediaArea}-questionnaire`)).toBeInTheDocument();
      });
    });

    it("steps forward in the questionnaire when Save and Continue is clicked", async () => {
      render(<EnvPermit task={generateTask({})} />);
      fireEvent.click(screen.getByTestId(`stepper-1`));
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
      goToNextStep();
      expect(screen.queryByTestId(`air-questionnaire`)).not.toBeInTheDocument();
      expect(screen.getByTestId(`land-questionnaire`)).toBeInTheDocument();
    });

    it("steps backward in the questionnaire when Back is clicked", async () => {
      render(<EnvPermit task={generateTask({})} />);
      fireEvent.click(screen.getByTestId(`stepper-2`));
      expect(screen.getByTestId(`land-questionnaire`)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.envQuestionPage.generic.backButtonText));
      expect(screen.queryByTestId(`land-questionnaire`)).not.toBeInTheDocument();
      expect(screen.getByTestId(`air-questionnaire`)).toBeInTheDocument();
    });

    it("throws an error if nothing is selected and navigates to step one", () => {
      render(<EnvPermit task={generateTask({})} />);
      fireEvent.click(screen.getByTestId(`stepper-5`));
      saveAndSeeResults();
      expect(screen.getByTestId("stepper-error-alert")).toBeInTheDocument();
      expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
    });

    it("navigates to the appropriate step when the step is clicked within the error alert", () => {
      render(<EnvPermit task={generateTask({})} />);
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
      render(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness({}))}>
          <EnvPermit task={generateTask({})} />
        </WithStatefulUserData>,
      );
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
  });

  describe("results", () => {
    describe("applicable", () => {
      const businessWithApplicableSubmittedQuestionnaire = generateBusiness({
        environmentData: {
          submitted: true,
          questionnaireData: generateEnvironmentQuestionnaireData({
            airOverrides: { constructionActivities: true },
            landOverrides: { noLand: true },
            wasteOverrides: { noWaste: true },
            drinkingWaterOverrides: { combinedWellCapacity: true },
            wasteWaterOverrides: { localSewage: true },
          }),
        },
      });

      it("displays only the applicable contact cards", async () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.contactDep.title));
        expect(screen.getByTestId("contact-air")).toBeInTheDocument();
        expect(screen.queryByTestId("contact-land")).not.toBeInTheDocument();
        expect(screen.queryByTestId("contact-waste")).not.toBeInTheDocument();
        expect(screen.getByTestId("contact-drinkingWater")).toBeInTheDocument();
        expect(screen.getByTestId("contact-wasteWater")).toBeInTheDocument();
      });

      it("displays only the applicable responses", async () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.seeYourResponses.title));
        expect(screen.getByTestId("air-responses")).toBeInTheDocument();
        expect(screen.queryByTestId("land-responses")).not.toBeInTheDocument();
        expect(screen.queryByTestId("waste-responses")).not.toBeInTheDocument();
        expect(screen.getByTestId("drinkingWater-responses")).toBeInTheDocument();
        expect(screen.getByTestId("wasteWater-responses")).toBeInTheDocument();
      });

      it("only shows the applicable media areas in the description", () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.air}, ${Config.envResultsPage.summary.mediaAreaText.drinkingWater}, and ${Config.envResultsPage.summary.mediaAreaText.wasteWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("displays the media areas joined by an 'and' in the description when only two media areas are applicable", () => {
        const businessWithTwoApplicableMediaArea = generateBusiness({
          environmentData: {
            submitted: true,
            questionnaireData: generateEnvironmentQuestionnaireData({
              airOverrides: { constructionActivities: true },
              drinkingWaterOverrides: { combinedWellCapacity: true },
            }),
          },
        });
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(businessWithTwoApplicableMediaArea)}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.air} and ${Config.envResultsPage.summary.mediaAreaText.drinkingWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("displays a single media area in the description when only one is applicable", () => {
        const businessWithOneApplicableMediaArea = generateBusiness({
          environmentData: {
            submitted: true,
            questionnaireData: generateEnvironmentQuestionnaireData({
              drinkingWaterOverrides: { combinedWellCapacity: true },
            }),
          },
        });
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(businessWithOneApplicableMediaArea)}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        const applicableMediaAreas = `${Config.envResultsPage.summary.mediaAreaText.drinkingWater}`;
        expect(screen.getByTestId("applicable-media-areas")).toHaveTextContent(
          applicableMediaAreas,
        );
      });

      it("takes the user back to step 0 when the Edit button is clicked", () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.editText));
        expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
      });
    });

    describe("not applicable", () => {
      const businessWithNonApplicableSubmittedQuestionnaire = generateBusiness({
        environmentData: {
          submitted: true,
          questionnaireData: generateEnvironmentQuestionnaireData({
            airOverrides: { noAir: true },
            landOverrides: { noLand: true },
            wasteOverrides: { noWaste: true },
            drinkingWaterOverrides: { noDrinkingWater: true },
            wasteWaterOverrides: { noWasteWater: true },
          }),
        },
      });

      it("shows the low applicablity summary page", () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithNonApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        expect(
          screen.getByText(Config.envResultsPage.lowApplicability.summaryLineOne),
        ).toBeInTheDocument();
      });

      it("takes the user back to step zero when the Edit button is clicked", () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithNonApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
        fireEvent.click(screen.getByText(Config.envResultsPage.editText));
        expect(screen.getByText(Config.envQuestionPage.instructions.lineOne)).toBeInTheDocument();
      });

      it("takes the user back to step zero when 'redo this form' is clicked", () => {
        render(
          <WithStatefulUserData
            initialUserData={generateUserDataForBusiness(
              businessWithNonApplicableSubmittedQuestionnaire,
            )}
          >
            <EnvPermit task={generateTask({})} />
          </WithStatefulUserData>,
        );
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
