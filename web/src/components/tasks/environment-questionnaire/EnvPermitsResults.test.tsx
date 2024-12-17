import { EnvPermitsResults } from "@/components/tasks/environment-questionnaire/EnvPermitsResults";
import { getMergedConfig } from "@/contexts/configContext";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateLandData,
  generateLandQuestionnaireData,
  generateWasteData,
} from "@businessnjgovnavigator/shared";
import { MediaArea, QuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import {
  generateBusiness,
  generateEnvironmentData,
  generateUserDataForBusiness,
  generateWasteQuestionnaireData,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

const Config = getMergedConfig();

describe("<EnvPermitsResults />", () => {
  let taskId: string;
  let mediaArea: MediaArea;
  let noSelectionOption: QuestionnaireFieldIds;

  const renderEnvPermitsResults = (business?: Business): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          business
            ? generateBusiness({
                ...business,
              })
            : generateBusiness({})
        )}
      >
        <EnvPermitsResults taskId={taskId} mediaArea={mediaArea} noSelectionOption={noSelectionOption} />
      </WithStatefulUserData>
    );
  };

  const renderEnvPermitsResultsAndSetupUser = (business?: Business): { user: UserEvent } => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          business
            ? generateBusiness({
                ...business,
              })
            : generateBusiness({})
        )}
      >
        <EnvPermitsResults taskId={taskId} mediaArea={mediaArea} noSelectionOption={noSelectionOption} />
      </WithStatefulUserData>
    );
    const user: UserEvent = userEvent.setup();
    return { user };
  };

  describe("waste", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      taskId = "waste-permitting";
      mediaArea = "waste";
      noSelectionOption = "noWaste";
    });

    it("displays the texts of the responses that are true in user data", () => {
      renderEnvPermitsResults(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: {
              questionnaireData: generateWasteQuestionnaireData({
                hazardousMedicalWaste: true,
                compostWaste: true,
              }),
              submitted: true,
            },
          }),
        })
      );
      expect(
        screen.getByText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.envQuestionPage.waste.questionnaireOptions.compostWaste)
      ).toBeInTheDocument();
    });

    it("doesn't display the texts of the responses that are false in user data", () => {
      renderEnvPermitsResults(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: {
              questionnaireData: generateWasteQuestionnaireData({
                hazardousMedicalWaste: true,
                constructionDebris: false,
                treatProcessWaste: false,
              }),
              submitted: true,
            },
          }),
        })
      );
      expect(
        screen.getByText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(Config.envQuestionPage.waste.questionnaireOptions.constructionDebris)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.envQuestionPage.waste.questionnaireOptions.treatProcessWaste)
      ).not.toBeInTheDocument();
    });

    it("updates submitted to false when the user clicks edit", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: generateWasteData({
              submitted: true,
            }),
          }),
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.editText));
      expect(currentBusiness().environmentData?.waste?.submitted).toBe(false);
    });

    it("updates submitted to false when the user clicks redo form", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: {
              questionnaireData: generateWasteQuestionnaireData({
                noWaste: true,
              }),
              submitted: true,
            },
          }),
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.lowApplicability.calloutRedo));
      expect(currentBusiness().environmentData?.waste?.submitted).toBe(false);
    });

    it("updates task progress to IN_PROGRESS when the user clicks edit", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: generateWasteData({
              submitted: true,
            }),
          }),
          taskProgress: { [taskId]: "COMPLETED" },
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.editText));
      expect(currentBusiness().taskProgress[taskId]).toBe("IN_PROGRESS");
    });

    it("updates task progress to IN_PROGRESS when the user clicks redo form", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: {
              questionnaireData: generateWasteQuestionnaireData({
                noWaste: true,
              }),
              submitted: true,
            },
          }),
          taskProgress: { [taskId]: "COMPLETED" },
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.lowApplicability.calloutRedo));
      expect(currentBusiness().taskProgress[taskId]).toBe("IN_PROGRESS");
    });
  });

  describe("land", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      taskId = "land-permitting";
      mediaArea = "land";
      noSelectionOption = "noLand";
    });

    it("displays the texts of the responses that are true in user data", () => {
      renderEnvPermitsResults(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: {
              questionnaireData: generateLandQuestionnaireData({
                takeOverExistingBiz: true,
                propertyAssessment: true,
                constructionActivities: true,
                siteImprovementWasteLands: true,
              }),
              submitted: true,
            },
          }),
        })
      );
      expect(
        screen.getByText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.envQuestionPage.land.questionnaireOptions.propertyAssessment)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.envQuestionPage.land.questionnaireOptions.constructionActivities)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.envQuestionPage.land.questionnaireOptions.siteImprovementWasteLands)
      ).toBeInTheDocument();
    });

    it("doesn't display the texts of the responses that are false in user data", () => {
      renderEnvPermitsResults(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: {
              questionnaireData: generateLandQuestionnaireData({
                takeOverExistingBiz: false,
                propertyAssessment: false,
                constructionActivities: false,
                siteImprovementWasteLands: false,
              }),
              submitted: true,
            },
          }),
        })
      );
      expect(
        screen.queryByText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.envQuestionPage.land.questionnaireOptions.propertyAssessment)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.envQuestionPage.land.questionnaireOptions.constructionActivities)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.envQuestionPage.land.questionnaireOptions.siteImprovementWasteLands)
      ).not.toBeInTheDocument();
    });

    it("updates submitted to false when the user clicks edit", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: generateLandData({
              submitted: true,
            }),
          }),
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.editText));
      expect(currentBusiness().environmentData?.land?.submitted).toBe(false);
    });

    it("updates submitted to false when the user clicks redo form", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: {
              questionnaireData: generateLandQuestionnaireData({
                noLand: true,
              }),
              submitted: true,
            },
          }),
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.lowApplicability.calloutRedo));
      expect(currentBusiness().environmentData?.land?.submitted).toBe(false);
    });

    it("updates task progress to IN_PROGRESS when the user clicks edit", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: generateLandData({
              submitted: true,
            }),
          }),
          taskProgress: { [taskId]: "COMPLETED" },
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.editText));
      expect(currentBusiness().taskProgress[taskId]).toBe("IN_PROGRESS");
    });

    it("updates task progress to IN_PROGRESS when the user clicks redo form", async () => {
      const { user } = renderEnvPermitsResultsAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: {
              questionnaireData: generateLandQuestionnaireData({
                noLand: true,
              }),
              submitted: true,
            },
          }),
          taskProgress: { [taskId]: "COMPLETED" },
        })
      );
      await user.click(screen.getByText(Config.envResultsPage.lowApplicability.calloutRedo));
      expect(currentBusiness().taskProgress[taskId]).toBe("IN_PROGRESS");
    });
  });
});
