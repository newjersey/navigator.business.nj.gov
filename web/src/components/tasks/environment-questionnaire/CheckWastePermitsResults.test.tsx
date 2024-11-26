import { CheckWastePermitsResults } from "@/components/tasks/environment-questionnaire/CheckWastePermitsResults";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { currentBusiness, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { Business, generateWasteQuestionnaireData } from "@businessnjgovnavigator/shared";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { generateEnvironmentData } from "@businessnjgovnavigator/shared/test/factories";
import { render, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

const Config = getMergedConfig();

describe("<CheckWastePermitsResults />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const task = generateTask({ id: "waste-permitting-test" });

  const renderCheckWastePermitsResults = (business?: Business): void => {
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
        <CheckWastePermitsResults task={task} />
      </WithStatefulUserData>
    );
  };

  const renderCheckWastePermitsResultsAndSetupUser = (business?: Business): { user: UserEvent } => {
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
        <CheckWastePermitsResults task={task} />
      </WithStatefulUserData>
    );
    const user: UserEvent = userEvent.setup();
    return { user };
  };

  it("displays the texts of the responses that are true in user data", () => {
    renderCheckWastePermitsResults(
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
      screen.getByText(Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.hazardousMedicalWaste)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.compostWaste)
    ).toBeInTheDocument();
  });

  it("doesn't display the texts of the responses that are false in user data", () => {
    renderCheckWastePermitsResults(
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
      screen.getByText(Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.hazardousMedicalWaste)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.constructionDebris)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions.treatProcessWaste)
    ).not.toBeInTheDocument();
  });

  it("updates submitted to false when the user clicks edit", async () => {
    const { user } = renderCheckWastePermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          waste: {
            submitted: true,
          },
        }),
      })
    );
    await user.click(screen.getByText(Config.wasteQuestionnaireResultsPage.editText));
    expect(currentBusiness().environmentData?.waste?.submitted).toBe(false);
  });

  it("updates submitted to false when the user clicks redo form", async () => {
    const { user } = renderCheckWastePermitsResultsAndSetupUser(
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
    await user.click(screen.getByText(Config.wasteQuestionnaireResultsPage.lowApplicability.calloutRedo));
    expect(currentBusiness().environmentData?.waste?.submitted).toBe(false);
  });

  it("updates task progress to IN_PROGRESS when the user clicks edit", async () => {
    const { user } = renderCheckWastePermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          waste: {
            submitted: true,
          },
        }),
        taskProgress: { [task.id]: "COMPLETED" },
      })
    );
    await user.click(screen.getByText(Config.wasteQuestionnaireResultsPage.editText));
    expect(currentBusiness().taskProgress[task.id]).toBe("IN_PROGRESS");
  });

  it("updates task progress to IN_PROGRESS when the user clicks redo form", async () => {
    const { user } = renderCheckWastePermitsResultsAndSetupUser(
      generateBusiness({
        environmentData: generateEnvironmentData({
          waste: {
            questionnaireData: generateWasteQuestionnaireData({
              noWaste: true,
            }),
            submitted: true,
          },
        }),
        taskProgress: { [task.id]: "COMPLETED" },
      })
    );
    await user.click(screen.getByText(Config.wasteQuestionnaireResultsPage.lowApplicability.calloutRedo));
    expect(currentBusiness().taskProgress[task.id]).toBe("IN_PROGRESS");
  });
});
