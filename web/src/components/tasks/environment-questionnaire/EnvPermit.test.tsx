import { EnvPermit } from "@/components/tasks/environment-questionnaire/EnvPermit";
import { getMergedConfig } from "@/contexts/configContext";
import { Task } from "@/lib/types/types";
import { generateTask } from "@/test/factories";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateLandQuestionnaireData,
  generateWasteQuestionnaireData,
} from "@businessnjgovnavigator/shared";
import { Business, generateEnvironmentData } from "@businessnjgovnavigator/shared/index";
import {
  generateAirQuestionnaireData,
  generateBusiness,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const isMobile = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

describe("<CheckEnvPermits />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderQuestionnaireAndSetupUser = ({
    business,
    task,
  }: {
    business?: Business;
    task: Task;
  }): { user: UserEvent } => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <EnvPermit task={task ?? generateTask({})} />
      </WithStatefulUserData>
    );
    const user = userEvent.setup();
    return { user };
  };

  const renderQuestionnaire = ({ business, task }: { business?: Business; task: Task }): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <EnvPermit task={task ?? generateTask({})} />
      </WithStatefulUserData>
    );
  };

  describe("land", () => {
    it("displays the results page when the user submits the questionnaire", async () => {
      const { user } = renderQuestionnaireAndSetupUser({ task: generateTask({ id: "land-permitting" }) });
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.land.questionnaireOptions.takeOverExistingBiz)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.land?.submitted).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
      });
    });

    it("displays the results page if submitted is true", () => {
      renderQuestionnaire({
        business: generateBusiness({
          environmentData: generateEnvironmentData({
            land: {
              questionnaireData: generateLandQuestionnaireData({
                takeOverExistingBiz: true,
              }),
              submitted: true,
            },
          }),
        }),
        task: generateTask({ id: "land-permitting" }),
      });
      expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
    });
  });

  describe("waste", () => {
    it("displays the results page when the user submits the questionnaire", async () => {
      const { user } = renderQuestionnaireAndSetupUser({ task: generateTask({ id: "waste-permitting" }) });
      await user.click(
        screen.getByLabelText(Config.envQuestionPage.waste.questionnaireOptions.hazardousMedicalWaste)
      );
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.waste?.submitted).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
      });
    });

    it("displays the results page if submitted is true", () => {
      renderQuestionnaire({
        business: generateBusiness({
          environmentData: generateEnvironmentData({
            waste: {
              questionnaireData: generateWasteQuestionnaireData({
                hazardousMedicalWaste: true,
              }),
              submitted: true,
            },
          }),
        }),
        task: generateTask({ id: "waste-permitting" }),
      });
      expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
    });
  });

  describe("air", () => {
    it("displays the results page when the user submits the questionnaire", async () => {
      const { user } = renderQuestionnaireAndSetupUser({ task: generateTask({ id: "air-permitting" }) });
      await user.click(screen.getByLabelText(Config.envQuestionPage.air.questionnaireOptions.emitEmissions));
      await user.click(screen.getByText(Config.envQuestionPage.generic.buttonText));
      expect(currentBusiness().environmentData?.air?.submitted).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
      });
    });

    it("displays the results page if submitted is true", () => {
      renderQuestionnaire({
        business: generateBusiness({
          environmentData: generateEnvironmentData({
            air: {
              questionnaireData: generateAirQuestionnaireData({
                emitPollutants: true,
              }),
              submitted: true,
            },
          }),
        }),
        task: generateTask({ id: "air-permitting" }),
      });
      expect(screen.getByText(Config.envResultsPage.title)).toBeInTheDocument();
    });
  });

  it.each([
    ["land", "land-permitting", "Check Your Land Permits"],
    ["waste", "waste-permitting", "Check Your Waste Permits"],
    ["air", "air-permitting", "Check Your Air Permits"],
  ])("renders the correct task for %s", (_, taskId: string, name: string) => {
    renderQuestionnaire({
      task: generateTask({ id: taskId, name }),
    });
    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it.each([
    ["land", "land-permitting"],
    ["waste", "waste-permitting"],
    ["air", "air-permitting"],
  ])("displays the questionnaire if submitted is false for %s", (mediaArea: string, taskId: string) => {
    renderQuestionnaire({
      business: generateBusiness({
        environmentData: generateEnvironmentData({
          [mediaArea]: {
            submitted: false,
          },
        }),
      }),
      task: generateTask({ id: taskId }),
    });
    expect(screen.getByText(Config.envQuestionPage.generic.title)).toBeInTheDocument();
  });

  it.each([
    ["land", "land-permitting", "Check Your Land Permits"],
    ["waste", "waste-permitting", "Check Your Waste Permits"],
    ["air", "air-permitting", "Check Your Air Permits"],
  ])("renders summary when %s task and is mobile", (_, taskId: string, name: string) => {
    isMobile(true);
    const task = generateTask({ id: taskId, name });
    renderQuestionnaire({
      task,
    });
    expect(screen.getByText(task.summaryDescriptionMd)).toBeInTheDocument();
  });

  it.each([
    ["land", "land-permitting", "Check Your Land Permits"],
    ["waste", "waste-permitting", "Check Your Waste Permits"],
    ["air", "air-permitting", "Check Your Air Permits"],
  ])("doesn't render summary when %s task and is not mobile", (_, taskId: string, name: string) => {
    isMobile(false);
    const task = generateTask({ id: taskId, name });
    renderQuestionnaire({
      task,
    });
    expect(screen.queryByText(task.summaryDescriptionMd)).not.toBeInTheDocument();
  });
});
