import { Content } from "@/components/Content";
import { BusinessStructureTask } from "@/components/tasks/BusinessStructureTask";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import {
  generateFormationData,
  generateProfileData,
  generateUserData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<BusinessStructureTask />", () => {
  const content = "some content here\n\n" + "${businessStructureSelectionComponent}\n\n" + "more content";
  const taskId = "12345";

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const renderTask = (initialUserData?: UserData): void => {
    const task = generateTask({ contentMd: content, id: taskId });
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData initialUserData={initialUserData || generateUserData({})}>
          <BusinessStructureTask task={task} />
        </WithStatefulUserData>
      </ThemeProvider>
    );
  };

  it("shows tooltip text on task progress checkbox", async () => {
    const userData = generateUserData({ taskProgress: { [taskId]: "IN_PROGRESS" } });
    renderTask(userData);
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.uncompletedTooltip);
  });

  it("shows completed tooltip text on task progress checkbox when task is completed", async () => {
    const userData = generateUserData({
      taskProgress: { [taskId]: "COMPLETED" },
      formationData: generateFormationData({ completedFilingPayment: true }),
    });
    renderTask(userData);
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults.lockedFieldTooltipText)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.profileDefaults.lockedFieldTooltipText);
  });

  it("shows locked formation tooltip text on task progress checkbox when formation is completed", async () => {
    const userData = generateUserData({ taskProgress: { [taskId]: "COMPLETED" } });
    renderTask(userData);
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.completedTooltip);
  });

  it("shows successful business structure alert when userData has a legal structure", () => {
    const legalStructure = randomLegalStructure();
    const userData = generateUserData({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
    });
    renderTask(userData);
    const successMessage = templateEval(Config.businessStructureTask.successMessage, {
      legalStructure: legalStructure.name,
    });
    useMockUserData(generateUserData({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("success-alert")).toContainHTML(
      renderToStaticMarkup(Content({ children: successMessage }))
    );
  });

  it("shows radio question when edit button is clicked in alter", () => {
    const legalStructure = randomLegalStructure();
    const userData = generateUserData({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
    });
    renderTask(userData);
    fireEvent.click(screen.getByText(Config.taskDefaults.editText));
    expect(screen.queryByText(Config.taskDefaults.editText)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
  });

  it("does not allow editing when formation is completed", () => {
    const legalStructure = randomLegalStructure();
    const userData = generateUserData({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
      formationData: generateFormationData({ completedFilingPayment: true }),
    });
    renderTask(userData);
    expect(screen.queryByText(Config.taskDefaults.editText)).not.toBeInTheDocument();
  });

  it("saves and shows success banner when save button clicked", async () => {
    const userData = generateUserData({ profileData: generateProfileData({ legalStructureId: undefined }) });
    renderTask(userData);
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    expect(screen.getByText(Config.businessStructureTask.radioQuestionHeader)).toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedHeader)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));

    expect(currentUserData().profileData.legalStructureId).toEqual("limited-liability-company");
    const name = LookupLegalStructureById("limited-liability-company").name;
    await waitFor(() => {
      expect(screen.getByTestId("success-alert")).toHaveTextContent(name);
    });
    expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
    expect(screen.getByText(Config.businessStructureTask.completedHeader)).toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.radioQuestionHeader)).not.toBeInTheDocument();

    expect(currentUserData().profileData.legalStructureId).toEqual("limited-liability-company");
  });

  it("updates task progress to in-progress and updates tooltip when editing", async () => {
    const legalStructure = randomLegalStructure();
    const userData = generateUserData({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
      taskProgress: { [taskId]: "COMPLETED" },
    });
    renderTask(userData);
    fireEvent.click(screen.getByText(Config.taskDefaults.editText));

    triggerQueueUpdate();
    await waitFor(() => {
      expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.uncompletedTooltip);
  });

  it("updates task progress to completed when saving", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({ legalStructureId: undefined }),
      taskProgress: { [taskId]: "IN_PROGRESS" },
    });
    renderTask(userData);
    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));
    await waitFor(() => {
      expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
    });
  });
});
