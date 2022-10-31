import { NexusFormationTask } from "@/components/tasks/NexusFormationTask";
import { getMergedConfig } from "@/contexts/configContext";
import * as taskFetcher from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Task } from "@/lib/types/types";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import { formationTaskId } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/async-content-fetchers/fetchTaskByFilename", () => {
  return { fetchTaskByFilename: jest.fn() };
});
const mockFetchTaskByFilename = (taskFetcher as jest.Mocked<typeof taskFetcher>).fetchTaskByFilename;

const Config = getMergedConfig();

describe("<NexusFormationTask />", () => {
  let nexusTask: Task;
  let legacyTask: Task;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    legacyTask = generateTask({
      contentMd: "legacy task content",
      name: "legacy task name",
      callToActionText: "legacy task cta",
    });
    mockFetchTaskByFilename.mockResolvedValue(legacyTask);
    nexusTask = generateTask({
      id: formationTaskId,
      contentMd: "stuff ${beginIndentationSection} things ${endIndentationSection} more",
    });
  });

  const renderTask = () => {
    render(<NexusFormationTask task={nexusTask} />);
  };

  it("shows warning when no business name", () => {
    useMockProfileData({ businessName: "", nexusDbaName: undefined });
    renderTask();
    expect(screen.getByTestId("name-search-warning")).toBeInTheDocument();
    expect(screen.queryByText(nexusTask.callToActionText)).not.toBeInTheDocument();
  });

  it("does not show warning when business name exists but DBA name is empty", async () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: "" });
    renderTask();
    expect(screen.getByText(nexusTask.callToActionText)).toBeInTheDocument();
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  it("does not show warning when business name exists and DBA exists", () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: "some dba name" });
    renderTask();
    expect(screen.getByText(nexusTask.callToActionText)).toBeInTheDocument();
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  it("does not show warning when business name exists and DBA undefined", async () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: undefined });
    renderTask();
    await screen.findByText(legacyTask.callToActionText);
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  describe("when not DBA", () => {
    beforeEach(() => {
      useMockProfileData({ businessName: "some name", nexusDbaName: undefined });
    });

    it("displays form-business-entity legacy task content and CTA but not header", async () => {
      renderTask();
      await screen.findByText(legacyTask.contentMd);
      expect(screen.getByText(legacyTask.callToActionText)).toBeInTheDocument();
      expect(screen.queryByText(legacyTask.name)).not.toBeInTheDocument();
      expect(screen.getByText(nexusTask.name)).toBeInTheDocument();
    });
  });

  describe("when DBA", () => {
    beforeEach(() => {
      useMockProfileData({ businessName: "some name", nexusDbaName: "my DBA name" });
    });

    it("displays form-business-entity-foreign task content", async () => {
      renderTask();
      expect(screen.getByText(nexusTask.name)).toBeInTheDocument();
      expect(screen.getByText(nexusTask.callToActionText)).toBeInTheDocument();
    });

    it("shows modal when clicking CTA", () => {
      renderTask();
      fireEvent.click(screen.getByText(nexusTask.callToActionText));
      expect(screen.getByText(Config.nexusFormationTask.dbaCtaModalHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.nexusFormationTask.dbaCtaModalContinueButtonText)).toBeInTheDocument();
      expect(screen.getByText(Config.nexusFormationTask.dbaCtaModalCancelButtonText)).toBeInTheDocument();
    });
  });
});
