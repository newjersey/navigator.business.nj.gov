import { createEmptyTaskDisplayContent, Task, TaskProgress } from "@/lib/types/types";
import TaskPage from "@/pages/tasks/[taskUrlSlug]";
import {
  generatePreferences,
  generateProfileData,
  generateStep,
  generateTask,
  generateTaskLink,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const setLargeScreen = (): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => true);
};

const renderPage = (task: Task, initialUserData?: UserData): RenderResult =>
  render(
    <materialUi.ThemeProvider theme={materialUi.createTheme()}>
      <WithStatefulUserData initialUserData={initialUserData}>
        <TaskPage task={task} displayContent={createEmptyTaskDisplayContent()} />
      </WithStatefulUserData>
    </materialUi.ThemeProvider>
  );

describe("task page", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    setLargeScreen();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  it("shows the task details", () => {
    const task = generateTask({
      name: "complete a tax form",
      contentMd:
        "## fill out your tax form\n" +
        "\n" +
        "it has to get done\n" +
        "\n" +
        "||\n" +
        "|---|\n" +
        "| destination: city clerk |\n",
      callToActionLink: "www.example.com",
      callToActionText: "Submit The Form Here",
    });

    subject = renderPage(task);
    expect(subject.getByText("complete a tax form")).toBeInTheDocument();
    expect(subject.getByText("fill out your tax form")).toBeInTheDocument();
    expect(subject.getByText("it has to get done")).toBeInTheDocument();
    expect(subject.getByText("destination: city clerk")).toBeInTheDocument();
    expect(subject.getByText("Submit The Form Here")).toBeInTheDocument();

    expect(subject.queryByText(Config.taskDefaults.backToRoadmapText, { exact: false })).toBeInTheDocument();
  });

  it("does not show button if no link available", () => {
    const task = generateTask({
      callToActionText: "Submit it Here",
      callToActionLink: "",
    });

    subject = renderPage(task);
    expect(subject.queryByText("Submit it Here")).not.toBeInTheDocument();
  });

  it("shows default text if call to action has link but no text", () => {
    const task = generateTask({
      callToActionText: "",
      callToActionLink: "www.example.com",
    });

    subject = renderPage(task);
    expect(subject.getByText("Start Application")).toBeInTheDocument();
  });

  it("shows updated content if different from static content", () => {
    const task = generateTask({
      id: "123",
      name: "original name",
      contentMd: "original description",
      callToActionText: "original call to action",
    });

    useMockRoadmapTask({
      id: "123",
      name: "a whole brand new name",
      contentMd: "a whole brand new description",
      callToActionText: "a whole brand new call to action",
    });

    subject = renderPage(task);
    expect(subject.queryByText("original description")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new description")).toBeInTheDocument();

    expect(subject.queryByText("original call to action")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new call to action")).toBeInTheDocument();

    expect(subject.queryByText("original name")).not.toBeInTheDocument();
    expect(subject.queryAllByText("a whole brand new name")).toHaveLength(2);
  });

  it("displays Not Started status when user data does not contain status", () => {
    subject = renderPage(generateTask({}), generateUserData({ taskProgress: {} }));

    expect(subject.getAllByText("Not started")[0]).toBeVisible();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    };
    subject = renderPage(generateTask({ id: taskId }), generateUserData({ taskProgress }));
    expect(subject.getAllByText("In progress")[0]).toBeVisible();
  });

  it("updates task status when progress is selected", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
    };

    subject = renderPage(generateTask({ id: taskId }), generateUserData({ taskProgress }));

    fireEvent.click(subject.getAllByText("Not started")[0]);
    fireEvent.click(subject.getByText("In progress"));
    expect(subject.getAllByText("In progress")[0]).toBeVisible();
    expect(currentUserData().taskProgress).toEqual({
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    });
  });

  it("shows congratulatory modal with link when PLAN section completed", () => {
    const planTaskId = "123";
    const startTaskId = "124";

    const planTask = generateTask({ id: planTaskId });
    const startTask = generateTask({ id: startTaskId });

    const userData = generateUserData({
      taskProgress: {
        [planTaskId]: "NOT_STARTED",
        [startTaskId]: "NOT_STARTED",
      },
      preferences: generatePreferences({ roadmapOpenSections: ["PLAN", "START"] }),
    });

    useMockRoadmap({
      steps: [
        generateStep({ tasks: [planTask], section: "PLAN" }),
        generateStep({ tasks: [startTask], section: "START" }),
      ],
    });

    subject = renderPage(planTask, userData);
    changeTaskNotStartedToCompleted();

    expect(currentUserData().taskProgress).toEqual({
      [planTaskId]: "COMPLETED",
      [startTaskId]: "NOT_STARTED",
    });

    expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START"]);
    const link = subject.queryByText(
      `${Config.sectionHeaders["START"]} ${Config.roadmapDefaults.congratulatorModalLinkText}`
    );
    expect(link).toBeInTheDocument();
    fireEvent.click(link as HTMLElement);
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("displays required tag in header if task is required", () => {
    const subject = renderPage(generateTask({ required: true }));
    expect(subject.getByText(Config.taskDefaults.requiredTagText)).toBeInTheDocument();
  });

  it("does not display required tag in header if task is not required", () => {
    const subject = renderPage(generateTask({ required: false }));
    expect(subject.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument();
  });

  it("overrides required tag in header from task in roadmap", () => {
    const id = "123";
    const taskInRoadmap = generateTask({ id, required: false });
    const taskStaticGeneration = generateTask({ id, required: true });
    useMockRoadmap({
      steps: [generateStep({ tasks: [taskInRoadmap], section: "PLAN" })],
    });
    const subject = renderPage(taskStaticGeneration);
    expect(subject.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument();
  });

  it("displays issuing form and agency in task footer when they are defined values", () => {
    const issuingAgency = "NJ Dept of Treasury";
    const formName = "xY39";
    const subject = renderPage(generateTask({ issuingAgency, formName }));

    expect(subject.getByText(`${Config.taskDefaults.issuingAgencyText}:`)).toBeInTheDocument();
    expect(subject.getByText(issuingAgency)).toBeInTheDocument();

    expect(subject.getByText(`${Config.taskDefaults.formNameText}:`)).toBeInTheDocument();
    expect(subject.getByText(formName)).toBeInTheDocument();
  });

  it("does not display issuing agency in task footer when it is undefined value", () => {
    const subject = renderPage(generateTask({ issuingAgency: undefined }));

    expect(subject.queryByText(`${Config.taskDefaults.formNameText}:`)).toBeInTheDocument();
    expect(subject.queryByText(`${Config.taskDefaults.issuingAgencyText}:`)).not.toBeInTheDocument();
  });

  it("does not display form name in task footer when it is undefined value", () => {
    const subject = renderPage(generateTask({ formName: undefined }));

    expect(subject.queryByText(`${Config.taskDefaults.issuingAgencyText}:`)).toBeInTheDocument();
    expect(subject.queryByText(`${Config.taskDefaults.formNameText}:`)).not.toBeInTheDocument();
  });

  it("does not display form name or agency in task footer when both are undefined", () => {
    const subject = renderPage(generateTask({ formName: undefined, issuingAgency: undefined }));

    expect(subject.queryByText(`${Config.taskDefaults.issuingAgencyText}:`)).not.toBeInTheDocument();
    expect(subject.queryByText(`${Config.taskDefaults.formNameText}:`)).not.toBeInTheDocument();
  });

  it("shows congratulatory modal without link when START section completed", () => {
    const planTaskId = "123";
    const startTaskId = "124";

    const planTask = generateTask({ id: planTaskId });
    const startTask = generateTask({ id: startTaskId });

    const userData = generateUserData({
      taskProgress: {
        [planTaskId]: "COMPLETED",
        [startTaskId]: "NOT_STARTED",
      },
      preferences: generatePreferences({ roadmapOpenSections: ["START"] }),
    });

    useMockRoadmap({
      steps: [
        generateStep({ tasks: [planTask], section: "PLAN" }),
        generateStep({ tasks: [startTask], section: "START" }),
      ],
    });

    subject = renderPage(startTask, userData);
    changeTaskNotStartedToCompleted();

    expect(currentUserData().taskProgress).toEqual({
      [planTaskId]: "COMPLETED",
      [startTaskId]: "COMPLETED",
    });

    expect(currentUserData().preferences.roadmapOpenSections).toEqual([]);
    expect(
      subject.queryByText(Config.roadmapDefaults.congratulatorModalLinkText, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("loads Search Business Names task screen for search-available-names", () => {
    subject = renderPage(generateTask({ id: "search-business-name" }));
    const searchInputField = subject.getByLabelText("Search business name") as HTMLInputElement;
    expect(searchInputField).toBeInTheDocument();
  });

  it("loads License task screen for apply-for-shop-license", () => {
    subject = renderPage(
      generateTask({ id: "apply-for-shop-license" }),
      generateUserData({ licenseData: undefined })
    );
    expect(subject.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for register-consumer-affairs", () => {
    subject = renderPage(
      generateTask({ id: "register-consumer-affairs" }),
      generateUserData({ licenseData: undefined })
    );
    expect(subject.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for pharmacy-license", () => {
    subject = renderPage(
      generateTask({ id: "pharmacy-license" }),
      generateUserData({ licenseData: undefined })
    );
    expect(subject.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for license-accounting", () => {
    subject = renderPage(
      generateTask({ id: "license-accounting" }),
      generateUserData({ licenseData: undefined })
    );
    expect(subject.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads construction post-onboarding question for task in template body", async () => {
    subject = renderPage(
      generateTask({
        postOnboardingQuestion: "construction-renovation",
        contentMd: "some content\n\n${postOnboardingQuestion}\n\nmore content",
      })
    );
    await waitFor(() => expect(subject.getByTestId("construction-renovation")).toBeInTheDocument());
    expect(subject.getByTestId("post-onboarding-radio-btn")).toBeInTheDocument();
    expect(subject.getByText("some content")).toBeInTheDocument();
    expect(subject.getByText("more content")).toBeInTheDocument();
    expect(subject.queryByText("${postOnboardingQuestion}")).not.toBeInTheDocument();
  });

  it("loads post-onboarding question for task at the bottom if not in template body", async () => {
    subject = renderPage(
      generateTask({
        postOnboardingQuestion: "construction-renovation",
        contentMd: "some content\n\nmore content",
      })
    );
    await waitFor(() => expect(subject.getByTestId("construction-renovation")).toBeInTheDocument());
    expect(subject.getByTestId("post-onboarding-radio-btn")).toBeInTheDocument();
    expect(subject.getByText("some content")).toBeInTheDocument();
    expect(subject.getByText("more content")).toBeInTheDocument();
  });

  it("toggles radio button for post-onboarding question", async () => {
    const initialUserData = generateUserData({
      profileData: generateProfileData({ constructionRenovationPlan: undefined }),
    });
    subject = renderPage(
      generateTask({ postOnboardingQuestion: "construction-renovation" }),
      initialUserData
    );

    await waitFor(() => expect(subject.getByTestId("construction-renovation")).toBeInTheDocument());
    expect(subject.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(subject.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();

    fireEvent.click(subject.getByTestId("post-onboarding-radio-true"));
    expect(subject.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(subject.queryByTestId("post-onboarding-true-content")).toBeInTheDocument();
    expect(currentUserData().profileData.constructionRenovationPlan).toBe(true);

    fireEvent.click(subject.getByTestId("post-onboarding-radio-false"));
    expect(subject.queryByTestId("post-onboarding-false-content")).toBeInTheDocument();
    expect(subject.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();
    expect(currentUserData().profileData.constructionRenovationPlan).toBe(false);
  });

  describe("next and previous task buttons", () => {
    const taskOne = generateTask({ urlSlug: "task-1" });
    const taskTwo = generateTask({ urlSlug: "task-2" });
    const taskThree = generateTask({ urlSlug: "task-3" });

    beforeEach(() => {
      useMockRoadmap({
        steps: [
          generateStep({ tasks: [taskOne] }),
          generateStep({ tasks: [taskTwo] }),
          generateStep({ tasks: [taskThree] }),
        ],
      });
    });

    it("renders only Next Task button for first task", async () => {
      subject = renderPage(taskOne);
      expect(subject.getByText(Config.taskDefaults.nextTaskButtonText)).toBeInTheDocument();
      expect(subject.queryByText(Config.taskDefaults.previousTaskButtonText)).not.toBeVisible();
    });

    it("renders only Previous Task button at last task", async () => {
      subject = renderPage(taskThree);
      expect(subject.queryByText(Config.taskDefaults.nextTaskButtonText)).not.toBeVisible();
      expect(subject.getByText(Config.taskDefaults.previousTaskButtonText)).toBeInTheDocument();
    });

    it("renders both Next and Previous buttons for task in the middle", async () => {
      subject = renderPage(taskTwo);
      expect(subject.getByText(Config.taskDefaults.nextTaskButtonText)).toBeInTheDocument();
      expect(subject.getByText(Config.taskDefaults.previousTaskButtonText)).toBeInTheDocument();
    });

    it("links to next and previous tasks", () => {
      subject = renderPage(taskTwo);
      fireEvent.click(subject.getByText(Config.taskDefaults.nextTaskButtonText));
      expect(mockPush).toHaveBeenCalledWith("/tasks/task-3");

      fireEvent.click(subject.getByText(Config.taskDefaults.previousTaskButtonText));
      expect(mockPush).toHaveBeenCalledWith("/tasks/task-1");
    });
  });

  describe("unlocked-by tasks", () => {
    const doThisFirstTask = generateTask({ urlSlug: "do-this-first" });
    const alsoThisOneTask = generateTask({ urlSlug: "also-this-one" });

    const useMockRoadmapWithTask = (task: Task): void => {
      useMockRoadmap({
        steps: [
          generateStep({
            tasks: [task, doThisFirstTask, alsoThisOneTask],
          }),
        ],
      });
    };

    it("does not show an alert when this task has nothing that it is unlocked by", () => {
      const task = generateTask({ unlockedBy: [] });
      useMockRoadmapWithTask(task);
      subject = renderPage(task);
      expect(
        subject.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("shows an alert with link when this task is unlocked by one other task", () => {
      const task = generateTask({
        unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
      });
      useMockRoadmapWithTask(task);
      subject = renderPage(task);
      expect(
        subject.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).toBeInTheDocument();
      expect(subject.queryByText("Do this first", { exact: false })).toBeInTheDocument();
      expect(subject.getByText("Do this first", { exact: false }).getAttribute("href")).toEqual(
        "do-this-first"
      );
    });

    it("shows an alert with links when this task is unlocked by several other tasks", () => {
      const task = generateTask({
        unlockedBy: [
          generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" }),
          generateTaskLink({ name: "Also this one", urlSlug: "also-this-one" }),
        ],
      });

      useMockRoadmapWithTask(task);
      subject = renderPage(task);

      expect(subject.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })).toBeInTheDocument();
      expect(
        subject.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).not.toBeInTheDocument();
      expect(subject.queryByText("Do this first", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("Also this one", { exact: false })).toBeInTheDocument();
      expect(subject.getByText("Do this first", { exact: false }).getAttribute("href")).toEqual(
        "do-this-first"
      );
      expect(subject.getByText("Also this one", { exact: false }).getAttribute("href")).toEqual(
        "also-this-one"
      );
    });

    it("ignores unlocked-by tasks on the page's default task", () => {
      subject = renderPage(
        generateTask({
          id: "this-task",
          unlockedBy: [generateTaskLink({ name: "NOT ON ROADMAP TASK" })],
        })
      );

      expect(subject.queryByText("NOT ON ROADMAP TASK", { exact: false })).not.toBeInTheDocument();
    });

    it("removes a task from the unlocked-by alert when its status is completed", () => {
      const task = generateTask({
        unlockedBy: [
          generateTaskLink({ name: "Do this first", urlSlug: "do-this-first", id: "do-this-first" }),
          generateTaskLink({ name: "Also this one", urlSlug: "also-this-one" }),
        ],
      });

      useMockUserData(generateUserData({ taskProgress: { "do-this-first": "COMPLETED" } }));
      useMockRoadmapWithTask(task);
      subject = renderPage(task);

      expect(
        subject.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).toBeInTheDocument();
      expect(subject.queryByText("Do this first", { exact: false })).not.toBeInTheDocument();
      expect(subject.queryByText("Also this one", { exact: false })).toBeInTheDocument();
    });
  });

  it("does not render next and prevous buttons when legal structure is LLC and form-business-entity task is rendered", () => {
    subject = renderPage(
      generateTask({ id: "form-business-entity" }),
      generateUserData({
        taskProgress: {},
        profileData: generateProfileData({ legalStructureId: "limited-liability-company" }),
      })
    );

    expect(subject.queryByTestId("nextAndPreviousButtons")).not.toBeInTheDocument();
  });

  const changeTaskNotStartedToCompleted = (): void => {
    fireEvent.click(subject.getAllByText("Not started")[0]);
    fireEvent.click(subject.getByText("Completed"));
    expect(subject.getAllByText("Completed")[0]).toBeVisible();
  };
});
