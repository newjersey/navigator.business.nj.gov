import { CheckLandPermitsResults } from "@/components/tasks/environment-questionnaire/land/CheckLandPermitsResults";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateLandQuestionnaireData } from "@businessnjgovnavigator/shared";
import { Business } from "@businessnjgovnavigator/shared/index";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { generateEnvironmentData } from "@businessnjgovnavigator/shared/test/factories";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

const Config = getMergedConfig();

describe("<CheckLandPermitsResults />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const task = generateTask({ id: "waste-permitting-test" });

  const renderCheckLandPermitsResults = (business?: Business): void => {
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
        <CheckLandPermitsResults task={task} />
      </WithStatefulUserData>
    );
  };

  const renderCheckLandPermitsResultsAndSetupUser = (business?: Business): { user: UserEvent } => {
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
        <CheckLandPermitsResults task={task} />
      </WithStatefulUserData>
    );
    const user: UserEvent = userEvent.setup();
    return { user };
  };

  it("displays the texts of the responses that are true in user data", () => {
    renderCheckLandPermitsResults(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            questionnaireData: generateLandQuestionnaireData({
              takeOverExistingBiz: true,
              propertyAssessment: true,
            }),
            submitted: true,
          },
        }),
      })
    );
    expect(
      screen.getByText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.envReqQuestionsPage.land.questionnaireOptions.propertyAssessment)
    ).toBeInTheDocument();
  });

  it("doesn't display the texts of the responses that are false in user data", () => {
    renderCheckLandPermitsResults(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            questionnaireData: generateLandQuestionnaireData({
              takeOverExistingBiz: true,
              propertyAssessment: false,
              constructionActivities: false,
            }),
            submitted: true,
          },
        }),
      })
    );
    expect(
      screen.getByText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.envReqQuestionsPage.land.questionnaireOptions.propertyAssessment)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.envReqQuestionsPage.land.questionnaireOptions.constructionActivities)
    ).not.toBeInTheDocument();
  });

  it("updates submitted to false when the user clicks edit", async () => {
    const { user } = renderCheckLandPermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            submitted: true,
          },
        }),
      })
    );
    await user.click(screen.getByText(Config.envReqResultsPage.editText));
    expect(currentBusiness().environmentData?.land?.submitted).toBe(false);
  });

  it("updates submitted to false when the user clicks redo form", async () => {
    const { user } = renderCheckLandPermitsResultsAndSetupUser(
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
    await user.click(screen.getByText(Config.envReqResultsPage.lowApplicability.calloutRedo));
    expect(currentBusiness().environmentData?.land?.submitted).toBe(false);
  });

  it("updates task progress to IN_PROGRESS when the user clicks edit", async () => {
    const { user } = renderCheckLandPermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            submitted: true,
          },
        }),
        taskProgress: { [task.id]: "COMPLETED" },
      })
    );
    await user.click(screen.getByText(Config.envReqResultsPage.editText));
    expect(currentBusiness().taskProgress[task.id]).toBe("IN_PROGRESS");
  });

  it("updates task progress to IN_PROGRESS when the user clicks redo form", async () => {
    const { user } = renderCheckLandPermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          land: {
            questionnaireData: generateLandQuestionnaireData({
              noLand: true,
            }),
            submitted: true,
          },
        }),
        taskProgress: { [task.id]: "COMPLETED" },
      })
    );
    await user.click(screen.getByText(Config.envReqResultsPage.lowApplicability.calloutRedo));
    expect(currentBusiness().taskProgress[task.id]).toBe("IN_PROGRESS");
  });
});
