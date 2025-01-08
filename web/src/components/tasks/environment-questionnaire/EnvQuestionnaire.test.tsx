import { EnvQuestionnaire } from "@/components/tasks/environment-questionnaire/EnvQuestionnaire";
import { getMergedConfig } from "@/contexts/configContext";
import * as helpers from "@/lib/utils/helpers";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateEnvironmentData, generateLandData, generateWasteData } from "@businessnjgovnavigator/shared";
import { MediaArea, QuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import { Business } from "@businessnjgovnavigator/shared/index";
import {
  generateAirData,
  generateBusiness,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

const Config = getMergedConfig();

jest.mock("@/lib/utils/helpers", () => {
  return {
    ...jest.requireActual("@/lib/utils/helpers"),
    scrollToTop: jest.fn(),
  };
});
const mockHelpers = helpers as jest.Mocked<typeof helpers>;

describe("<EnvQuestionnaire />", () => {
  let taskId: string;
  let mediaArea: MediaArea;
  let noSelectionOption: QuestionnaireFieldIds;

  const renderQuestionnaireAndSetupUser = (business?: Business): { user: UserEvent } => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <EnvQuestionnaire taskId={taskId} mediaArea={mediaArea} noSelectionOption={noSelectionOption} />
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

    it("clears all choices if the user selects none of the above", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      );
      await user.click(screen.getByText(Config.envQuestionPage.waste.questionnaireOptions.noWaste));
      const generateHazardousWaste: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste
      );
      expect(generateHazardousWaste).not.toBeChecked();
    });

    it("clears none of the above if another selection is made", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.noWaste));
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      );
      const noWaste: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.waste.questionnaireOptions.noWaste
      );
      expect(noWaste).not.toBeChecked();
    });

    it("throws an error if no selection is made and user clicks save", async () => {
      const { user } = renderQuestionnaireAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            waste: generateWasteData({
              questionnaireData: {
                hazardousMedicalWaste: false,
                constructionDebris: false,
                compostWaste: false,
                treatProcessWaste: false,
                noWaste: false,
              },
              submitted: false,
            }),
          }),
        })
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(screen.getByText(Config.envQuestionPage.generic.errorText)).toBeInTheDocument();
    });

    it("updates user data with the user's selections when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.waste?.questionnaireData?.hazardousMedicalWaste).toBe(true);
    });

    it("updates the task progress to COMPLETED when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });
  });

  describe("land", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      taskId = "land-permitting";
      mediaArea = "land";
      noSelectionOption = "noLand";
    });

    it("clears all choices if the user selects none of the above", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      );
      await user.click(screen.getByText(Config.envQuestionPage.land.questionnaireOptions.noLand));
      const generateHazardousWaste: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz
      );
      expect(generateHazardousWaste).not.toBeChecked();
    });

    it("clears none of the above if another selection is made", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.noLand));
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      );
      const noWaste: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.land.questionnaireOptions.noLand
      );
      expect(noWaste).not.toBeChecked();
    });

    it("throws an error if no selection is made and user clicks save", async () => {
      const { user } = renderQuestionnaireAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            land: generateLandData({
              questionnaireData: {
                takeOverExistingBiz: false,
                propertyAssessment: false,
                constructionActivities: false,
                siteImprovementWasteLands: false,
                noLand: false,
              },
              submitted: false,
            }),
          }),
        })
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(screen.getByText(Config.envQuestionPage.generic.errorText)).toBeInTheDocument();
    });

    it("updates user data with the user's selections when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.land?.questionnaireData?.takeOverExistingBiz).toBe(true);
    });

    it("updates the task progress to COMPLETED when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });
  });

  describe("air", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      taskId = "air-permitting";
      mediaArea = "air";
      noSelectionOption = "noAir";
    });

    it("clears all choices if the user selects none of the above", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.emitEmissions));
      await user.click(screen.getByText(Config.envQuestionPage.air.questionnaireOptions.noAir));
      const emitEmissions: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.air.questionnaireOptions.emitEmissions
      );
      expect(emitEmissions).not.toBeChecked();
    });

    it("clears none of the above if another selection is made", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.noAir));
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.emitEmissions));
      const noAir: HTMLInputElement = screen.getByLabelText(
        Config.envQuestionPage.air.questionnaireOptions.noAir
      );
      expect(noAir).not.toBeChecked();
    });

    it("throws an error if no selection is made and user clicks save", async () => {
      const { user } = renderQuestionnaireAndSetupUser(
        generateBusiness({
          environmentData: generateEnvironmentData({
            air: generateAirData({
              questionnaireData: {
                emitEmissions: false,
                emitPollutants: false,
                constructionActivities: false,
                noAir: false,
              },
              submitted: false,
            }),
          }),
        })
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(screen.getByText(Config.envQuestionPage.generic.errorText)).toBeInTheDocument();
    });

    it("updates user data with the user's selections when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.emitEmissions));
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.air?.questionnaireData?.emitEmissions).toBe(true);
    });

    it("updates the task progress to COMPLETED when saved", async () => {
      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.emitEmissions));
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });
  });

  describe("scrollToTop", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    const getOptionText = (mediaArea: string): string => {
      if (mediaArea === "land") return Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz;
      if (mediaArea === "waste") return Config.envQuestionPage.waste.questionnaireOptions.compostWaste;
      if (mediaArea === "air") return Config.envQuestionPage.air.questionnaireOptions.emitEmissions;
      return "";
    };

    it.each([
      [
        {
          taskId: "land-permitting",
          mediaArea: "land",
          noSelectionOption: "noLand",
        },
      ],
      [
        {
          taskId: "waste-permitting",
          mediaArea: "waste",
          noSelectionOption: "noWaste",
        },
      ],
      [
        {
          taskId: "air-permitting",
          mediaArea: "air",
          noSelectionOption: "noAir",
        },
      ],
    ])("calls scrollToTop when saved when media area is %s", async (obj) => {
      taskId = obj.taskId;
      mediaArea = obj.mediaArea as MediaArea;
      noSelectionOption = obj.noSelectionOption as QuestionnaireFieldIds;

      const { user } = renderQuestionnaireAndSetupUser();
      await user.click(screen.getByText(getOptionText(mediaArea)));
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(mockHelpers.scrollToTop).toHaveBeenCalledTimes(1);
    });
  });
});
