import { getMergedConfig } from "@/contexts/configContext";
import * as fetchPostOnboardingModule from "@/lib/async-content-fetchers/fetchPostOnboarding";
import { createEmptyTaskDisplayContent, Task } from "@/lib/types/types";
import TaskPage from "@/pages/tasks/[taskUrlSlug]";
import {
  generatePostOnboarding,
  generateStep,
  generateTask,
  generateTaskLink,
  operatingPhasesDisplayingBusinessStructurePrompt,
  operatingPhasesNotDisplayingBusinessStructurePrompt,
  randomPublicFilingLegalType,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockRoadmapResponse, useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  formationTaskId,
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  generateUserDataForBusiness,
  LookupTaskAgencyById,
} from "@businessnjgovnavigator/shared";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/async-content-fetchers/fetchPostOnboarding", () => ({ fetchPostOnboarding: jest.fn() }));

const mockFetchPostOnboarding = (fetchPostOnboardingModule as jest.Mocked<typeof fetchPostOnboardingModule>)
  .fetchPostOnboarding;

const setLargeScreen = (value = true): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const renderPage = (task: Task, initialBusiness?: Business): void => {
  render(
    <materialUi.ThemeProvider theme={materialUi.createTheme()}>
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(initialBusiness ?? generateBusiness({}))}
      >
        <TaskPage task={task} displayContent={createEmptyTaskDisplayContent()} municipalities={[]} />
      </WithStatefulUserData>
    </materialUi.ThemeProvider>
  );
};

describe("task page", () => {
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

    renderPage(task);
    expect(screen.getByText("complete a tax form")).toBeInTheDocument();
    expect(screen.getByText("fill out your tax form")).toBeInTheDocument();
    expect(screen.getByText("it has to get done")).toBeInTheDocument();
    expect(screen.getByText("destination: city clerk")).toBeInTheDocument();
    expect(screen.getByText("Submit The Form Here")).toBeInTheDocument();

    expect(screen.getByText(Config.taskDefaults.backToRoadmapText, { exact: false })).toBeInTheDocument();
  });

  it("does not show button if no link available", () => {
    const task = generateTask({
      callToActionText: "Submit it Here",
      callToActionLink: "",
    });

    renderPage(task);
    expect(screen.queryByText("Submit it Here")).not.toBeInTheDocument();
  });

  it("shows default text if call to action has link but no text", () => {
    const task = generateTask({
      callToActionText: "",
      callToActionLink: "www.example.com",
    });

    renderPage(task);
    expect(screen.getByText("Start Application")).toBeInTheDocument();
  });

  it("shows loading state when business is undefined", () => {
    render(
      <WithStatefulUserData initialUserData={undefined}>
        <TaskPage
          task={generateTask({})}
          displayContent={createEmptyTaskDisplayContent()}
          municipalities={[]}
        />
      </WithStatefulUserData>
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows loading state when roadmap is undefined", () => {
    setMockRoadmapResponse({ roadmap: undefined });
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness({}))}>
        <TaskPage
          task={generateTask({})}
          displayContent={createEmptyTaskDisplayContent()}
          municipalities={[]}
        />
      </WithStatefulUserData>
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows updated content if different from static content", () => {
    const task = generateTask({
      id: "123",
      name: "original name",
      contentMd: "original description",
      callToActionText: "original call to action",
      stepNumber: 1,
    });

    useMockRoadmapTask({
      id: "123",
      name: "a whole brand new name",
      contentMd: "a whole brand new description",
      callToActionText: "a whole brand new call to action",
      stepNumber: 1,
    });

    renderPage(task);

    expect(screen.queryByText("original description")).not.toBeInTheDocument();
    expect(screen.getByText("a whole brand new description")).toBeInTheDocument();

    expect(screen.queryByText("original call to action")).not.toBeInTheDocument();
    expect(screen.getByText("a whole brand new call to action")).toBeInTheDocument();

    expect(screen.queryByText("original name")).not.toBeInTheDocument();
    expect(screen.queryAllByText("a whole brand new name")).toHaveLength(2);
  });

  it("displays form in task footer when defined value", () => {
    const formName = "xY39";
    renderPage(generateTask({ formName }));
    expect(screen.getByText(`${Config.taskDefaults.formNameText}:`)).toBeInTheDocument();
    expect(screen.getByText(formName)).toBeInTheDocument();
  });

  it("does not display agency in task footer when agencyId and agencyAdditionalContext are undefined", () => {
    renderPage(generateTask({ agencyId: undefined, agencyAdditionalContext: undefined }));
    expect(screen.queryByText(`${Config.taskDefaults.issuingAgencyText}:`)).not.toBeInTheDocument();
  });

  it("does not display form name in task footer when it is undefined value", () => {
    renderPage(generateTask({ formName: undefined }));
    expect(screen.queryByText(`${Config.taskDefaults.formNameText}:`)).not.toBeInTheDocument();
  });

  it("displays agencyId as its name when it is defined", () => {
    renderPage(generateTask({ agencyId: "nj-consumer-affairs", agencyAdditionalContext: undefined }));
    expect(screen.getByText(`${Config.taskDefaults.issuingAgencyText}:`)).toBeInTheDocument();
    expect(screen.getByText(LookupTaskAgencyById("nj-consumer-affairs").name)).toBeInTheDocument();
    expect(screen.queryByText("nj-consumer-affairs")).not.toBeInTheDocument();
  });

  it("displays agencyAdditionalContext when it is defined", () => {
    renderPage(generateTask({ agencyId: undefined, agencyAdditionalContext: "Board of Something" }));
    expect(screen.getByText(`${Config.taskDefaults.issuingAgencyText}:`)).toBeInTheDocument();
    expect(screen.getByText("Board of Something")).toBeInTheDocument();
  });

  it("displays agencyId as its name and agencyAdditionalContext comma separated when both defined", () => {
    renderPage(
      generateTask({ agencyId: "nj-consumer-affairs", agencyAdditionalContext: "Board of Something" })
    );
    expect(screen.getByText(`${Config.taskDefaults.issuingAgencyText}:`)).toBeInTheDocument();
    const agencyName = LookupTaskAgencyById("nj-consumer-affairs").name;
    const expectedText = `${agencyName}, Board of Something`;
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("loads License task screen for apply-for-shop-license", () => {
    renderPage(generateTask({ id: "apply-for-shop-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for home-health-aide-license", () => {
    renderPage(
      generateTask({ id: "home-health-aide-license" }),
      generateBusiness({ licenseData: undefined })
    );
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for register-consumer-affairs", () => {
    renderPage(
      generateTask({ id: "register-consumer-affairs" }),
      generateBusiness({ licenseData: undefined })
    );
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for pharmacy-license", () => {
    renderPage(generateTask({ id: "pharmacy-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for license-accounting", () => {
    renderPage(generateTask({ id: "license-accounting" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for license-massage-therapy", () => {
    renderPage(generateTask({ id: "license-massage-therapy" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for moving-company-license", () => {
    renderPage(generateTask({ id: "moving-company-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for architect-license", () => {
    renderPage(generateTask({ id: "architect-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for hvac-license", () => {
    renderPage(generateTask({ id: "hvac-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads License task screen for appraiser-license", () => {
    renderPage(generateTask({ id: "appraiser-license" }), generateBusiness({ licenseData: undefined }));
    expect(screen.getByTestId("cta-secondary")).toBeInTheDocument();
  });

  it("loads construction post-onboarding question for task in template body", async () => {
    mockFetchPostOnboarding.mockResolvedValue(
      generatePostOnboarding({ filename: "construction-renovation" })
    );

    renderPage(
      generateTask({
        postOnboardingQuestion: "construction-renovation",
        contentMd: "some content\n\n${postOnboardingQuestion}\n\nmore content",
      })
    );
    await waitFor(() => {
      expect(screen.getByTestId("construction-renovation")).toBeInTheDocument();
    });
    expect(screen.getByTestId("post-onboarding-radio-btn")).toBeInTheDocument();
    expect(screen.getByText("some content")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${postOnboardingQuestion}")).not.toBeInTheDocument();
  });

  it("loads post-onboarding question for task at the bottom if not in template body", async () => {
    mockFetchPostOnboarding.mockResolvedValue(
      generatePostOnboarding({ filename: "construction-renovation" })
    );

    renderPage(
      generateTask({
        postOnboardingQuestion: "construction-renovation",
        contentMd: "some content\n\nmore content",
        requiresLocation: false,
      })
    );
    await waitFor(() => {
      expect(screen.getByTestId("construction-renovation")).toBeInTheDocument();
    });
    expect(screen.getByTestId("post-onboarding-radio-btn")).toBeInTheDocument();
    expect(screen.getByText("some content")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
  });

  it("toggles radio button for post-onboarding question", async () => {
    mockFetchPostOnboarding.mockResolvedValue(
      generatePostOnboarding({ filename: "construction-renovation" })
    );

    const initialBusiness = generateBusiness({
      profileData: generateProfileData({ constructionRenovationPlan: undefined }),
    });
    renderPage(
      generateTask({
        postOnboardingQuestion: "construction-renovation",
        requiresLocation: false,
      }),
      initialBusiness
    );

    await waitFor(() => {
      expect(screen.getByTestId("construction-renovation")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("post-onboarding-radio-true"));
    expect(screen.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("post-onboarding-true-content")).toBeInTheDocument();
    expect(currentBusiness().profileData.constructionRenovationPlan).toBe(true);

    fireEvent.click(screen.getByTestId("post-onboarding-radio-false"));
    expect(screen.getByTestId("post-onboarding-false-content")).toBeInTheDocument();
    expect(screen.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();
    expect(currentBusiness().profileData.constructionRenovationPlan).toBe(false);
  });

  describe("next and previous task buttons", () => {
    const taskOne = generateTask({ urlSlug: "task-1", stepNumber: 1 });
    const taskTwo = generateTask({ urlSlug: "task-2", stepNumber: 2 });
    const taskThree = generateTask({ urlSlug: "task-3", stepNumber: 3 });

    beforeEach(() => {
      useMockRoadmap({
        steps: [
          generateStep({ stepNumber: 1 }),
          generateStep({ stepNumber: 2 }),
          generateStep({ stepNumber: 3 }),
        ],
        tasks: [taskOne, taskTwo, taskThree],
      });
    });

    it("renders only Next Task button for first task", () => {
      renderPage(taskOne);
      expect(screen.getByText(Config.taskDefaults.nextTaskButtonText)).toBeInTheDocument();
      expect(screen.queryByText(Config.taskDefaults.previousTaskButtonText)).not.toBeInTheDocument();
    });

    it("renders only Previous Task button at last task", () => {
      renderPage(taskThree);
      expect(screen.queryByText(Config.taskDefaults.nextTaskButtonText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taskDefaults.previousTaskButtonText)).toBeInTheDocument();
    });

    it("renders both Next and Previous buttons for task in the middle", () => {
      renderPage(taskTwo);
      expect(screen.getByText(Config.taskDefaults.nextTaskButtonText)).toBeInTheDocument();
      expect(screen.getByText(Config.taskDefaults.previousTaskButtonText)).toBeInTheDocument();
    });

    it("links to next and previous tasks", () => {
      renderPage(taskTwo);
      fireEvent.click(screen.getByText(Config.taskDefaults.nextTaskButtonText));
      expect(mockPush).toHaveBeenCalledWith("/tasks/task-3");

      fireEvent.click(screen.getByText(Config.taskDefaults.previousTaskButtonText));
      expect(mockPush).toHaveBeenCalledWith("/tasks/task-1");
    });
  });

  describe("unlocked-by tasks", () => {
    const doThisFirstTask = generateTask({ urlSlug: "do-this-first", stepNumber: 1 });
    const alsoThisOneTask = generateTask({ urlSlug: "also-this-one", stepNumber: 1 });

    const useMockRoadmapWithTask = (task: Task): void => {
      useMockRoadmap({
        steps: [
          generateStep({
            stepNumber: 1,
          }),
        ],
        tasks: [task, doThisFirstTask, alsoThisOneTask],
      });
    };

    it("does not show an alert when this task has nothing that it is unlocked by", () => {
      const task = generateTask({ unlockedBy: [] });
      useMockRoadmapWithTask(task);
      renderPage(task);
      expect(
        screen.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("shows an alert with link when this task is unlocked by one other task", () => {
      const task = generateTask({
        unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
      });
      useMockRoadmapWithTask(task);
      renderPage(task);
      expect(
        screen.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
      expect(screen.getByText(Config.taskDefaults.unlockedBySingular, { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Do this first", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Do this first", { exact: false })).toHaveAttribute("href", "do-this-first");
    });

    it("shows an alert with links when this task is unlocked by several other tasks", () => {
      const task = generateTask({
        unlockedBy: [
          generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" }),
          generateTaskLink({ name: "Also this one", urlSlug: "also-this-one" }),
        ],
      });

      useMockRoadmapWithTask(task);
      renderPage(task);

      expect(screen.getByText(Config.taskDefaults.unlockedByPlural, { exact: false })).toBeInTheDocument();
      expect(
        screen.queryByText(Config.taskDefaults.unlockedBySingular, { exact: false })
      ).not.toBeInTheDocument();
      expect(screen.getByText("Do this first", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Also this one", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Do this first", { exact: false })).toHaveAttribute("href", "do-this-first");
      expect(screen.getByText("Also this one", { exact: false })).toHaveAttribute("href", "also-this-one");
    });

    it("ignores unlocked-by tasks on the page's default task", () => {
      renderPage(
        generateTask({
          id: "this-task",
          unlockedBy: [generateTaskLink({ name: "NOT ON ROADMAP TASK" })],
        })
      );

      expect(screen.queryByText("NOT ON ROADMAP TASK", { exact: false })).not.toBeInTheDocument();
    });

    it("removes a task from the unlocked-by alert when its status is completed", () => {
      const task = generateTask({
        unlockedBy: [
          generateTaskLink({ name: "Do this first", urlSlug: "do-this-first", id: "do-this-first" }),
          generateTaskLink({ name: "Also this one", urlSlug: "also-this-one" }),
        ],
      });

      useMockRoadmapWithTask(task);
      renderPage(task, generateBusiness({ taskProgress: { "do-this-first": "COMPLETED" } }));

      expect(
        screen.queryByText(Config.taskDefaults.unlockedByPlural, { exact: false })
      ).not.toBeInTheDocument();
      expect(screen.getByText(Config.taskDefaults.unlockedBySingular, { exact: false })).toBeInTheDocument();
      expect(screen.queryByText("Do this first", { exact: false })).not.toBeInTheDocument();
      expect(screen.getByText("Also this one", { exact: false })).toBeInTheDocument();
    });
  });

  it("does not render next and previous buttons for STARTING when legal structure allows for business formation and form-business-entity task is rendered", () => {
    renderPage(
      generateTask({ id: formationTaskId }),
      generateBusiness({
        taskProgress: {},
        profileData: generateProfileData({
          legalStructureId: randomPublicFilingLegalType(),
          businessPersona: "STARTING",
        }),
      })
    );

    expect(screen.queryByTestId("nextAndPreviousButtons")).not.toBeInTheDocument();
  });

  it("does not render next and previous buttons for FOREIGN when legal structure allows for business formation and form-business-entity task is rendered", () => {
    renderPage(
      generateTask({ id: formationTaskId }),
      generateBusiness({
        taskProgress: {},
        profileData: generateProfileData({
          legalStructureId: randomPublicFilingLegalType(),
          businessPersona: "FOREIGN",
        }),
      })
    );

    expect(screen.queryByTestId("nextAndPreviousButtons")).not.toBeInTheDocument();
  });

  it.each(operatingPhasesDisplayingBusinessStructurePrompt)(
    "hides nextUrlSlug on business structure task when its not mark as completed for %p operating phase",
    (operatingPhase) => {
      setLargeScreen(false);
      renderPage(
        generateTask({ id: businessStructureTaskId }),
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase,
          }),
          taskProgress: { [businessStructureTaskId]: "NOT_STARTED" },
        })
      );
      expect(screen.queryByTestId("nextUrlSlugButton")).not.toBeInTheDocument();
    }
  );

  it.each(operatingPhasesNotDisplayingBusinessStructurePrompt)(
    "shows nextUrlSlug on business structure task when its not mark as completed for %p operating phase",
    (operatingPhase) => {
      setLargeScreen(false);
      renderPage(
        generateTask({ id: businessStructureTaskId }),
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase,
          }),
          taskProgress: { [businessStructureTaskId]: "COMPLETED" },
        })
      );

      expect(screen.getByTestId("nextUrlSlugButton")).toBeInTheDocument();
    }
  );

  describe("deferred location question", () => {
    const contentWithLocationSection =
      "some content\n\n" +
      "${beginLocationDependentSection}\n\n" +
      "inner content\n\n" +
      "${endLocationDependentSection}\n\n" +
      "more content\n\n";

    it("shows deferred location question if task requiresLocation=true and municipality is undefined", () => {
      const task = generateTask({
        requiresLocation: true,
        contentMd: contentWithLocationSection,
        postOnboardingQuestion: undefined,
      });
      const businessWithoutMunicipality = generateBusiness({
        profileData: generateProfileData({
          municipality: undefined,
        }),
      });

      renderPage(task, businessWithoutMunicipality);
      expect(screen.getByTestId("deferred-location-task")).toBeInTheDocument();
      expect(screen.queryByTestId("deferred-location-content")).not.toBeInTheDocument();
    });

    it("shows deferred location content if task requiresLocation=true and user has municipalities set", () => {
      const task = generateTask({
        requiresLocation: true,
        contentMd: contentWithLocationSection,
        postOnboardingQuestion: undefined,
      });
      const businessWithMunicipality = generateBusiness({
        profileData: generateProfileData({
          municipality: generateMunicipality({}),
        }),
      });

      renderPage(task, businessWithMunicipality);
      expect(screen.getByTestId("deferred-location-task")).toBeInTheDocument();
      expect(screen.getByTestId("deferred-location-content")).toBeInTheDocument();
    });

    it("does not show deferred location question if task requiresLocation=false", () => {
      const task = generateTask({
        requiresLocation: false,
        contentMd: contentWithLocationSection,
        postOnboardingQuestion: undefined,
      });
      renderPage(task);
      expect(screen.queryByTestId("deferred-location-task")).not.toBeInTheDocument();
    });

    it("loads deferred location question using keys in template body", async () => {
      renderPage(
        generateTask({
          requiresLocation: true,
          contentMd: contentWithLocationSection,
          postOnboardingQuestion: undefined,
        })
      );
      await screen.findByTestId("deferred-location-task");
      expect(screen.getByText("some content")).toBeInTheDocument();
      expect(screen.getByText("more content")).toBeInTheDocument();
      expect(screen.queryByText("${beginLocationDependentSection}")).not.toBeInTheDocument();
      expect(screen.queryByText("${endLocationDependentSection}")).not.toBeInTheDocument();
    });
  });
});
