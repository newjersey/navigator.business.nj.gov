import { DashboardOnDesktop } from "@/components/dashboard/DashboardOnDesktop";
import { getMergedConfig } from "@/contexts/configContext";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionLink,
  AnytimeActionTask,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
  SidebarCardContent,
} from "@/lib/types/types";
import {
  generateAnytimeActionLink,
  generateAnytimeActionTask,
  generateBusinessPersona,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  operatingPhasesDisplayingAltHomeBasedBusinessDescription,
  operatingPhasesDisplayingHomeBasedPrompt,
  operatingPhasesNotDisplayingHomeBasedPrompt,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  OperatingPhases,
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { OperatingPhase, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const Config = getMergedConfig();

const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>): RoadmapDisplayContent => {
  return {
    sidebarDisplayContent: sidebar ?? {
      welcome: generateSidebarCardContent({}),
    },
  };
};

const operatingPhasesThatDontDisplayHideableRoadmapTasks = OperatingPhases.filter((obj) => {
  return !obj.displayHideableRoadmapTasks;
}).map((obj) => obj.id);

const operatingPhasesThatDisplayHideableRoadmapTasks = OperatingPhases.filter((obj) => {
  return obj.displayHideableRoadmapTasks;
}).map((obj) => obj.id);

describe("<DashboardOnDesktop />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({ onboardingFormProgress: "COMPLETED" });
    useMockRoadmap({});
    useMockRouter({});
    jest.useFakeTimers();
  });

  const renderDashboardComponent = ({
    sidebarDisplayContent,
    operateReferences,
    anytimeActionLinks,
    anytimeActionTask,
    anytimeActionLicenseReinstatements,
    licenseEvents,
  }: {
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    operateReferences?: Record<string, OperateReference>;
    anytimeActionLinks?: AnytimeActionLink[];
    anytimeActionTask?: AnytimeActionTask[];
    anytimeActionLicenseReinstatements?: AnytimeActionLicenseReinstatement[];
    licenseEvents?: LicenseEventType[];
  }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <DashboardOnDesktop
          operateReferences={operateReferences ?? {}}
          displayContent={createDisplayContent(sidebarDisplayContent)}
          fundings={[]}
          certifications={[]}
          anytimeActionLinks={anytimeActionLinks ?? []}
          anytimeActionTasks={anytimeActionTask ?? []}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatements ?? []}
          licenseEvents={licenseEvents ?? []}
        />
      </ThemeProvider>
    );
  };

  const renderStatefulDashboardComponent = ({ business }: { business?: Business }): void => {
    setupStatefulUserDataContext();

    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <ThemeProvider theme={createTheme()}>
          <DashboardOnDesktop
            operateReferences={{}}
            displayContent={createDisplayContent()}
            fundings={[]}
            certifications={[]}
            anytimeActionLinks={[]}
            anytimeActionTasks={[]}
            anytimeActionLicenseReinstatements={[]}
            licenseEvents={[]}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  it("shows steps and tasks from roadmap", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          timeEstimate: "1-2 weeks",
          stepNumber: 1,
        }),
        generateStep({
          name: "step2",
          stepNumber: 2,
        }),
      ],
      tasks: [
        generateTask({ name: "task1", stepNumber: 1 }),
        generateTask({ name: "task2", stepNumber: 1 }),
        generateTask({ name: "task3", stepNumber: 2 }),
      ],
    });

    renderDashboardComponent({});

    expect(screen.getByText("step1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("(1-2 weeks)")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();

    expect(screen.getByText("step2", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("task3")).toBeInTheDocument();
  });

  it("shows task progress tag", () => {
    useMockRoadmap({
      steps: [generateStep({ name: "step1", stepNumber: 1 }), generateStep({ name: "step2", stepNumber: 2 })],
      tasks: [
        generateTask({ id: "task1", name: "task1", stepNumber: 1 }),
        generateTask({ id: "task2", name: "task2", stepNumber: 1 }),
        generateTask({ id: "task3", name: "task3", stepNumber: 2 }),
      ],
    });

    useMockBusiness({
      taskProgress: { task1: "IN_PROGRESS", task2: "COMPLETED" },
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("displays each step under associated section", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
        generateStep({ name: "step3", section: "PLAN" }),
        generateStep({ name: "step4", section: "START" }),
      ],
    });

    renderDashboardComponent({});

    const sectionPlan = screen.getByTestId("section-plan");
    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    expect(within(sectionStart).queryByText("step1")).not.toBeInTheDocument();
    expect(within(sectionStart).queryByText("step3")).not.toBeInTheDocument();
    expect(within(sectionStart).getByText("step2")).toBeInTheDocument();
    expect(within(sectionStart).getByText("step4")).toBeInTheDocument();
  });

  it("displays sections based on userData preferences", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockBusiness({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
      }),
      taxFilingData: generateTaxFilingData({}),
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    const sectionPlan = screen.getByTestId("section-plan");
    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  it.each(operatingPhasesThatDontDisplayHideableRoadmapTasks)(
    "does not render HideableTasks for %s that don't display HideableRoadmapTasks",
    (OperatingPhase) => {
      useMockBusiness({ profileData: generateProfileData({ operatingPhase: OperatingPhase }) });
      renderDashboardComponent({});

      expect(screen.queryByTestId("hideableTasks")).not.toBeInTheDocument();
    }
  );

  it.each(operatingPhasesThatDisplayHideableRoadmapTasks)(
    "renders HideableTasks for %s that display HideableRoadmapTasks",
    (OperatingPhase) => {
      useMockBusiness({
        profileData: generateProfileData({ operatingPhase: OperatingPhase }),
        onboardingFormProgress: "COMPLETED",
      });
      renderDashboardComponent({});

      expect(
        screen.getByText(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText)
      ).toBeInTheDocument();
    }
  );

  describe("deferred onboarding question", () => {
    describe.each(operatingPhasesNotDisplayingHomeBasedPrompt)(
      "phases not displaying home-based prompt",
      (operatingPhase) => {
        describe(`${operatingPhase}`, () => {
          it("does not show home-based business question when not applicable to operating phase", () => {
            useMockBusiness(
              generateBusiness({
                profileData: generateProfileData({
                  industryId: randomHomeBasedIndustry(),
                  homeBasedBusiness: undefined,
                  businessPersona: generateBusinessPersona(),
                  operatingPhase: operatingPhase,
                }),
                onboardingFormProgress: "COMPLETED",
              })
            );

            renderDashboardComponent({});

            expect(
              screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
            ).not.toBeInTheDocument();
            expect(
              screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
            ).not.toBeInTheDocument();
          });
        });
      }
    );

    describe.each(operatingPhasesDisplayingHomeBasedPrompt)(
      "phases displaying home-based prompt",
      (operatingPhase) => {
        describe(`${operatingPhase}`, () => {
          it("does not show home-based business question when not applicable to industry", () => {
            useMockBusiness(
              generateBusiness({
                profileData: generateProfileData({
                  homeBasedBusiness: undefined,
                  industryId: randomNonHomeBasedIndustry(),
                  businessPersona: generateBusinessPersona(),
                  operatingPhase: operatingPhase,
                }),
                onboardingFormProgress: "COMPLETED",
              })
            );

            renderDashboardComponent({});

            expect(
              screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
            ).not.toBeInTheDocument();
            expect(
              screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
            ).not.toBeInTheDocument();
          });

          it("sets homeBasedBusiness in profile and removes question when radio is selected", async () => {
            const business = generateBusiness({
              profileData: generateProfileData({
                industryId: randomHomeBasedIndustry(),
                homeBasedBusiness: undefined,
                operatingPhase: operatingPhase,
              }),
              onboardingFormProgress: "COMPLETED",
            });
            renderStatefulDashboardComponent({ business });

            fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
            fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));

            await waitFor(() => {
              return expect(
                screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
              ).not.toBeInTheDocument();
            });
            expect(currentBusiness().profileData.homeBasedBusiness).toEqual(true);
          });

          it("shallow routes with query parameter when radio is selected", async () => {
            const business = generateBusiness({
              profileData: generateProfileData({
                industryId: randomHomeBasedIndustry(),
                homeBasedBusiness: undefined,
                operatingPhase: operatingPhase,
              }),
              onboardingFormProgress: "COMPLETED",
            });

            renderStatefulDashboardComponent({ business });

            fireEvent.click(screen.getByTestId("home-based-business-radio-false"));
            fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
            await waitFor(() => {
              return expect(mockPush).toHaveBeenCalledWith(
                { query: { deferredQuestionAnswered: "true" } },
                undefined,
                {
                  shallow: true,
                }
              );
            });
          });
        });
      }
    );

    describe.each(operatingPhasesDisplayingAltHomeBasedBusinessDescription)(
      "phases displaying home-based prompt with alt description",
      (operatingPhase) => {
        describe(`${operatingPhase}`, () => {
          it("shows home-based business question with alt description when applicable to industry and not yet answered", () => {
            useMockBusiness(
              generateBusiness({
                profileData: generateProfileData({
                  industryId: randomHomeBasedIndustry(),
                  homeBasedBusiness: undefined,
                  businessPersona: generateBusinessPersona(),
                  operatingPhase: operatingPhase,
                }),
                onboardingFormProgress: "COMPLETED",
              })
            );

            renderDashboardComponent({});

            expect(
              screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
            ).not.toBeInTheDocument();
            expect(
              screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
            ).toBeInTheDocument();
          });
        });
      }
    );
  });

  describe("anytime actions", () => {
    const operatingPhasesWithAnytimeActions = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAnytimeActions;
    }).map((phase) => phase.id);

    const operatingPhasesWithoutAnytimeActions = OperatingPhases.filter((phase: OperatingPhase) => {
      return !phase.displayAnytimeActions;
    }).map((phase) => phase.id);

    it.each(operatingPhasesWithoutAnytimeActions)(
      "does not display anytime action section for %s",
      (phase) => {
        useMockBusiness(generateBusiness({ profileData: generateProfileData({ operatingPhase: phase }) }));
        renderDashboardComponent({
          anytimeActionLinks: [generateAnytimeActionLink({})],
          anytimeActionTask: [generateAnytimeActionTask({})],
        });

        expect(screen.queryByTestId("anytimeActionDropdown")).not.toBeInTheDocument();
      }
    );

    it.each(operatingPhasesWithAnytimeActions)("displays anytime action section for %s", (phase) => {
      useMockBusiness(generateBusiness({ profileData: generateProfileData({ operatingPhase: phase }) }));
      renderDashboardComponent({
        anytimeActionLinks: [generateAnytimeActionLink({})],
        anytimeActionTask: [generateAnytimeActionTask({})],
      });

      expect(screen.getByTestId("anytimeActionDropdown")).toBeInTheDocument();
    });
  });

  it("displays step2 for guest mode user when business structure task is completed", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockBusiness({
      profileData: generateProfileData({
        operatingPhase: OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
      }),
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    expect(within(screen.getByTestId("section-start")).getByText("step2")).toBeVisible();
  });

  it("does not render tabs in desktop view", () => {
    renderDashboardComponent({});
    expect(screen.getByTestId("rightSidebarPageLayout")).toBeInTheDocument();
    expect(screen.queryByTestId("two-tab-Layout")).not.toBeInTheDocument();
  });
});
