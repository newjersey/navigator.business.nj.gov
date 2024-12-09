import { CheckLandPermitsQuestionnaire } from "@/components/tasks/environment-questionnaire/land/CheckLandPermitsQuestionnaire";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { Business } from "@businessnjgovnavigator/shared/index";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

let setShowNeedsAccountModal: jest.Mock;
const Config = getMergedConfig();

describe("<CheckLandPermitsQuestionnaire />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setShowNeedsAccountModal = jest.fn();
  });

  const task = generateTask({ id: "land-permitting-test" });

  const renderQuestionnaireAndSetupUser = (business?: Business): { user: UserEvent } => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <CheckLandPermitsQuestionnaire task={task} />
      </WithStatefulUserData>
    );
    const user: UserEvent = userEvent.setup();
    return { user };
  };

  const renderQuestionnaireAndSetupUserWithAuthAlert = (business?: Business): { user: UserEvent } => {
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
          <CheckLandPermitsQuestionnaire task={task} />
        </WithStatefulUserData>,
        IsAuthenticated.FALSE,
        { showNeedsAccountModal: false, setShowNeedsAccountModal: setShowNeedsAccountModal }
      )
    );
    const user: UserEvent = userEvent.setup();
    return { user };
  };

  it("shows the registration modal if the user in not authenticated", async () => {
    const { user } = renderQuestionnaireAndSetupUserWithAuthAlert();
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    await waitFor(() => {
      return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });
  });

  it("clears all choices if the user selects none of the above", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    await user.click(screen.getByText(Config.envReqQuestionsPage.land.questionnaireOptions.noLand));
    const generateHazardousWaste: HTMLInputElement = screen.getByLabelText(
      Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz
    );
    expect(generateHazardousWaste).not.toBeChecked();
  });

  it("clears none of the above if another selection is made", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.noLand));
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    const noWaste: HTMLInputElement = screen.getByLabelText(
      Config.envReqQuestionsPage.land.questionnaireOptions.noLand
    );
    expect(noWaste).not.toBeChecked();
  });

  it("throws an error if no selection is made and user clicks save", async () => {
    const { user } = renderQuestionnaireAndSetupUser(
      generateBusiness({
        environmentData: {
          waste: undefined,
        },
      })
    );
    await user.click(screen.getByText(Config.envReqQuestionsPage.generic.buttonText));
    expect(screen.getByText(Config.envReqQuestionsPage.generic.errorText)).toBeInTheDocument();
  });

  it("updates user data with the user's selections when saved", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    await user.click(screen.getByText(Config.envReqQuestionsPage.generic.buttonText));
    expect(currentBusiness().environmentData?.land?.questionnaireData?.takeOverExistingBiz).toBe(true);
  });

  it("updates the task progress to COMPLETED when saved", async () => {
    const { user } = renderQuestionnaireAndSetupUser();
    await user.click(
      screen.getByLabelText(Config.envReqQuestionsPage.land.questionnaireOptions.takeOverExistingBiz)
    );
    await user.click(screen.getByText(Config.envReqQuestionsPage.generic.buttonText));
    expect(currentBusiness().taskProgress[task.id]).toEqual("COMPLETED");
  });
});
