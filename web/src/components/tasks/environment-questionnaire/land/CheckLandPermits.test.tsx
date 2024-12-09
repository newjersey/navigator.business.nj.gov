import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateLandQuestionnaireData } from "@businessnjgovnavigator/shared";
import { Business, generateEnvironmentData } from "@businessnjgovnavigator/shared/index";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { CheckLandPermits } from "./CheckLandPermits";

const Config = getMergedConfig();

describe("<CheckLandPermits />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const task = generateTask({});

  const renderQuestionnaireAndSetupUser = (business?: Business): { user: UserEvent } => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <CheckLandPermits task={task} />
      </WithStatefulUserData>
    );
    const user = userEvent.setup();
    return { user };
  };

  const renderQuestionnaire = (business?: Business): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <CheckLandPermits task={task} />
      </WithStatefulUserData>
    );
  };

  it("displays the results page when the user submits the questionnaire", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    await user.click(screen.getByText(Config.envReqQuestionsPage.generic.buttonText));
    expect(currentBusiness().environmentData?.land?.submitted).toBe(true);
    await waitFor(() => {
      expect(screen.getByText(Config.envReqResultsPage.title)).toBeInTheDocument();
    });
  });

  it("displays the questionnaire if submitted is false", async () => {
    renderQuestionnaire(
      generateBusiness({
        environmentData: {
          land: {
            submitted: false,
          },
        },
      })
    );
    expect(screen.getByText(Config.envReqQuestionsPage.generic.title)).toBeInTheDocument();
  });

  it("displays the results page if submitted is true", () => {
    renderQuestionnaire(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            questionnaireData: generateLandQuestionnaireData({
              takeOverExistingBiz: true,
            }),
            submitted: true,
          },
        }),
      })
    );
    expect(screen.getByText(Config.envReqResultsPage.title)).toBeInTheDocument();
  });
});
