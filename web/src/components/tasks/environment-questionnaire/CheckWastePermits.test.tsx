import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateEnvironmentData,
  generateUserData,
  generateWasteQuestionnaireData,
} from "@businessnjgovnavigator/shared";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { CheckWastePermits } from "./CheckWastePermits";

const Config = getMergedConfig();

describe("<CheckWastePermits />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const task = generateTask({});

  const renderQuestionnaireAndSetupUser = (business?: Business): { user: UserEvent } => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(business ?? generateBusiness(generateUserData({}), {}))}
      >
        <CheckWastePermits task={task} />
      </WithStatefulUserData>
    );
    const user = userEvent.setup();
    return { user };
  };

  const renderQuestionnaire = (business?: Business): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(business ?? generateBusiness(generateUserData({}), {}))}
      >
        <CheckWastePermits task={task} />
      </WithStatefulUserData>
    );
  };

  it("displays the results page when the user submits the questionnaire", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(
      screen.getByLabelText(
        Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.hazardousMedicalWaste
      )
    );
    await user.click(screen.getByText(Config.wasteQuestionnaireQuestionsPage.buttonText));
    expect(currentBusiness().environmentData?.waste?.submitted).toBe(true);
    await waitFor(() => {
      expect(screen.getByText(Config.wasteQuestionnaireResultsPage.title)).toBeInTheDocument();
    });
  });

  it("displays the questionnaire if submitted is false", async () => {
    renderQuestionnaire(
      generateBusiness(generateUserData({}), {
        environmentData: {
          waste: {
            submitted: false,
          },
        },
      })
    );
    expect(screen.getByText(Config.wasteQuestionnaireQuestionsPage.title)).toBeInTheDocument();
  });

  it("displays the results page if submitted is true", () => {
    renderQuestionnaire(
      generateBusiness(generateUserData({}), {
        environmentData: generateEnvironmentData({
          waste: {
            questionnaireData: generateWasteQuestionnaireData({
              hazardousMedicalWaste: true,
            }),
            submitted: true,
          },
        }),
      })
    );
    expect(screen.getByText(Config.wasteQuestionnaireResultsPage.title)).toBeInTheDocument();
  });
});
