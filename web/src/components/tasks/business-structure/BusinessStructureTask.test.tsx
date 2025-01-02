import { Content } from "@/components/Content";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import {
  generateBusiness,
  generateFormationData,
  generateProfileData,
  generateUserDataForBusiness,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

const Config = getMergedConfig();

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));

describe("<BusinessStructureTask />", () => {
  const content = "some content here\n\n" + "${businessStructureSelectionComponent}\n\n" + "more content";
  const taskId = "12345";

  beforeEach(() => {
    vi.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const renderTask = (business: Business): void => {
    const task = generateTask({ contentMd: content, id: taskId });
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
          <BusinessStructureTask task={task} />
        </WithStatefulUserData>
      </ThemeProvider>
    );
  };

  it("shows tooltip text on task progress checkbox", async () => {
    const business = generateBusiness({ taskProgress: { [taskId]: "IN_PROGRESS" } });
    renderTask(business);
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.uncompletedTooltip);
  });

  it("shows completed tooltip text on task progress checkbox when task is completed", async () => {
    const business = generateBusiness({
      taskProgress: { [taskId]: "COMPLETED" },
      formationData: generateFormationData({ completedFilingPayment: true }),
    });
    renderTask(business);
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults.default.lockedFieldTooltipText)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.profileDefaults.default.lockedFieldTooltipText);
  });

  it("shows locked formation tooltip text on task progress checkbox when formation is completed", async () => {
    const business = generateBusiness({ taskProgress: { [taskId]: "COMPLETED" } });
    renderTask(business);
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.uncompletedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.completedTooltip);
  });

  it("shows successful business structure alert when business has a legal structure", () => {
    const legalStructure = randomLegalStructure();
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
    });
    renderTask(business);
    const successMessage = templateEval(Config.businessStructureTask.successMessage, {
      legalStructure: legalStructure.name,
    });
    useMockBusiness(generateBusiness({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("success-alert")).toContainHTML(
      renderToStaticMarkup(Content({ children: successMessage }))
    );
  });

  it("shows radio question when edit button is clicked in alter", () => {
    const legalStructure = randomLegalStructure();
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
    });
    renderTask(business);
    fireEvent.click(screen.getByText(Config.taskDefaults.editText));
    expect(screen.queryByText(Config.taskDefaults.editText)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
  });

  it("does not allow editing when formation is completed", () => {
    const legalStructure = randomLegalStructure();
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
      formationData: generateFormationData({ completedFilingPayment: true }),
    });
    renderTask(business);
    expect(screen.queryByText(Config.taskDefaults.editText)).not.toBeInTheDocument();
  });

  it("saves and shows success banner when save button clicked", async () => {
    const business = generateBusiness({ profileData: generateProfileData({ legalStructureId: undefined }) });
    renderTask(business);
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    expect(screen.getByText(Config.businessStructureTask.radioQuestionHeader)).toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.completedHeader)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));

    expect(currentBusiness().profileData.legalStructureId).toEqual("limited-liability-company");
    const name = LookupLegalStructureById("limited-liability-company").name;
    await waitFor(() => {
      expect(screen.getByTestId("success-alert")).toHaveTextContent(name);
    });
    expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
    expect(screen.getByText(Config.businessStructureTask.completedHeader)).toBeInTheDocument();
    expect(screen.queryByText(Config.businessStructureTask.radioQuestionHeader)).not.toBeInTheDocument();

    expect(currentBusiness().profileData.legalStructureId).toEqual("limited-liability-company");
  });

  it("allows saving without changes", async () => {
    const legalStructure = randomLegalStructure();
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
    });
    renderTask(business);

    fireEvent.click(screen.getByText(Config.taskDefaults.editText));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));

    await waitFor(() => {
      expect(screen.getByTestId("success-alert")).toHaveTextContent(legalStructure.name);
    });
    expect(currentBusiness().profileData.legalStructureId).toEqual(legalStructure.id);
  });

  it("updates task progress to in-progress and updates tooltip when editing", async () => {
    const legalStructure = randomLegalStructure();
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
      taskProgress: { [taskId]: "COMPLETED" },
    });
    renderTask(business);
    fireEvent.click(screen.getByText(Config.taskDefaults.editText));

    triggerQueueUpdate();
    await waitFor(() => {
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    fireEvent.mouseOver(screen.getByTestId("status-info-tooltip"));
    expect(screen.queryByText(Config.businessStructureTask.completedTooltip)).not.toBeInTheDocument();
    await screen.findByText(Config.businessStructureTask.uncompletedTooltip);
  });

  it("updates task progress to completed when saving", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: undefined }),
      taskProgress: { [taskId]: "IN_PROGRESS" },
    });
    renderTask(business);
    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));
    await waitFor(() => {
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });
  });

  it("updates operating phase from GUEST_MODE to GUEST_MODE_WITH_BUSINESS_STRUCTURE when business structure is saved", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        legalStructureId: undefined,
        operatingPhase: OperatingPhaseId.GUEST_MODE,
      }),
    });
    renderTask(business);
    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));
    await waitFor(() => {
      expect(currentBusiness().profileData.operatingPhase).toEqual(
        OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
      );
    });
  });

  it("does not update operating phase to GUEST_MODE_WITH_BUSINESS_STRUCTURE when business structure is saved", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        legalStructureId: undefined,
        operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
      }),
    });
    renderTask(business);
    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));
    await waitFor(() => {
      expect(currentBusiness().profileData.operatingPhase).toBeDefined();
    });
    expect(currentBusiness().profileData.operatingPhase).not.toEqual(
      OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
    );
  });

  it("updates task progress to in-progress when business structure radio is selected", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: undefined }),
      taskProgress: { [taskId]: "NOT_STARTED" },
    });
    renderTask(business);
    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    triggerQueueUpdate();
    await waitFor(() => {
      expect(screen.getByTestId("taskProgress")).toHaveTextContent(Config.taskProgress.IN_PROGRESS);
    });
    await waitFor(() => {
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });
  });

  it("renders error message and alert when save button is clicked without a radio being selected and removed when selected", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: undefined }),
      taskProgress: { [taskId]: "NOT_STARTED" },
    });
    renderTask(business);

    expect(screen.queryByTestId("business-structure-error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("business-structure-alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.businessStructureTask.saveButton));
    await waitFor(() => {
      expect(screen.getByTestId("business-structure-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("business-structure-alert")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("limited-liability-company"));
    await waitFor(() => {
      expect(screen.queryByTestId("business-structure-error")).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId("business-structure-alert")).not.toBeInTheDocument();
  });

  it("updates task to NOT_STARTED when remove button is clicked", async () => {
    const legalStructure = randomLegalStructure();

    const business = generateBusiness({
      profileData: generateProfileData({ legalStructureId: legalStructure.id }),
      taskProgress: { [taskId]: "COMPLETED" },
    });
    renderTask(business);
    fireEvent.click(screen.getByText(Config.taskDefaults.removeText));

    await waitFor(() => {
      expect(screen.queryByText(Config.taskDefaults.removeText)).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    expect(currentBusiness().taskProgress[taskId]).toEqual("NOT_STARTED");
    expect(currentBusiness().profileData.legalStructureId).toEqual(undefined);
  });

  it("updates operating phase from GUEST_MODE_WITH_BUSINESS_STRUCTURE to GUEST_MODE when business structure is removed", async () => {
    const legalStructure = randomLegalStructure();

    const business = generateBusiness({
      profileData: generateProfileData({
        legalStructureId: legalStructure.id,
        operatingPhase: OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
      }),
      taskProgress: { [taskId]: "COMPLETED" },
    });

    renderTask(business);
    fireEvent.click(screen.getByText(Config.taskDefaults.removeText));

    await waitFor(() => {
      expect(screen.queryByText(Config.taskDefaults.removeText)).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    expect(currentBusiness().taskProgress[taskId]).toEqual("NOT_STARTED");
    expect(currentBusiness().profileData.legalStructureId).toEqual(undefined);
    expect(currentBusiness().profileData.operatingPhase).toEqual("GUEST_MODE");
  });
});
