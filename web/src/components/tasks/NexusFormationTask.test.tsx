/* eslint-disable testing-library/no-unnecessary-act */
import { NexusFormationTask } from "@/components/tasks/NexusFormationTask";
import { getMergedConfig } from "@/contexts/configContext";
import * as taskFetcher from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Task } from "@/lib/types/types";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/async-content-fetchers/fetchTaskByFilename", () => ({ fetchTaskByFilename: jest.fn() }));
const mockFetchTaskByFilename = (taskFetcher as jest.Mocked<typeof taskFetcher>).fetchTaskByFilename;

const Config = getMergedConfig();

describe("<NexusFormationTask />", () => {
  let nexusTask: Task;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    mockFetchTaskByFilename.mockResolvedValue(generateTask({}));
    nexusTask = generateTask({
      id: "form-business-entity-foreign",
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

  it("does not show warning when business name exists but DBA name is empty", () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: "" });
    renderTask();
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  it("does not show warning when business name exists and DBA exists", () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: "some dba name" });
    renderTask();
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  it("does not show warning when business name exists and DBA undefined", async () => {
    useMockProfileData({ businessName: "some name", nexusDbaName: undefined });
    await act(() => renderTask());
    expect(screen.queryByTestId("name-search-warning")).not.toBeInTheDocument();
  });

  describe("when not DBA", () => {
    beforeEach(() => {
      useMockProfileData({ businessName: "some name", nexusDbaName: undefined });
    });

    it("displays form-business-entity legacy task content and CTA but not header", async () => {
      mockFetchTaskByFilename.mockResolvedValue(
        generateTask({
          contentMd: "legacy task content",
          name: "legacy task name",
          callToActionText: "legacy task cta",
        })
      );

      await act(() => renderTask());
      await waitFor(() => {
        expect(screen.getByText("legacy task content")).toBeInTheDocument();
      });
      expect(screen.getByText("legacy task cta")).toBeInTheDocument();
      expect(screen.queryByText("legacy task name")).not.toBeInTheDocument();
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
