import { DashboardOnMobile } from "@/components/dashboard/DashboardOnMobile";
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
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  defaultDateFormat,
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  generateUserDataForBusiness,
  getCurrentDate,
  OperatingPhases,
} from "@businessnjgovnavigator/shared";
import { OperatingPhase, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
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
  if (obj.id === OperatingPhaseId.DOMESTIC_EMPLOYER) return false;
  return obj.displayHideableRoadmapTasks;
}).map((obj) => obj.id);

describe("<DashboardOnMobile />", () => {
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
        <DashboardOnMobile
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
          <DashboardOnMobile
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
      expect(
        screen.queryAllByRole("heading", {
          level: 2,
          name: Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText,
        }).length
      ).toEqual(0);
    }
  );

  it("renders HideableTasks for DOMESTIC_EMPLOYER OperatingPhase with alternate heading", () => {
    useMockBusiness({
      profileData: generateProfileData({ operatingPhase: OperatingPhaseId.DOMESTIC_EMPLOYER }),
      onboardingFormProgress: "COMPLETED",
    });
    renderDashboardComponent({});

    expect(
      screen.queryByText(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText)
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText,
      })
    ).toBeInTheDocument();
  });

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

  it("does not display filings calendar as list when taxfiling is not populated", () => {
    const currentDate = getCurrentDate();
    const dateOfFormation = currentDate.format(defaultDateFormat);

    useMockBusiness({
      profileData: generateProfileData({ dateOfFormation: dateOfFormation }),
      taxFilingData: generateTaxFilingData({ filings: [] }),
      onboardingFormProgress: "COMPLETED",
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardComponent({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });

  it("does not display filings calendar as list when formation data is not populated", () => {
    const dueDate = getCurrentDate().add(12, "months");
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });
    useMockBusiness({
      profileData: generateProfileData({ dateOfFormation: undefined }),
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardComponent({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });

  it("renders tabs", () => {
    renderDashboardComponent({});

    expect(screen.queryByTestId("rightSidebarPageLayout")).not.toBeInTheDocument();
    expect(screen.getByTestId("two-tab-Layout")).toBeInTheDocument();
  });

  it("displays filings calendar as list when taxfiling is populated and operatingPhase has ListCalendar", () => {
    const dueDate = getCurrentDate().add(1, "days");
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });
    useMockBusiness({
      profileData: generateProfileData({ operatingPhase: OperatingPhaseId.FORMED }),
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      onboardingFormProgress: "COMPLETED",
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardComponent({ operateReferences });

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it("sets phaseNewlyChanged to false on mobile when rendering For You tab", async () => {
    const business = generateBusiness({
      preferences: generatePreferences({ phaseNewlyChanged: true }),
      onboardingFormProgress: "COMPLETED",
    });
    renderStatefulDashboardComponent({ business });

    expect(userDataWasNotUpdated()).toBe(true);

    fireEvent.click(screen.getByTestId("for-you-tab"));
    await waitFor(() => {
      return expect(currentBusiness().preferences.phaseNewlyChanged).toBe(false);
    });
  });

  it("shows indicator next to For You tab when phaseNewlyChanged is true", async () => {
    const business = generateBusiness({
      preferences: generatePreferences({ phaseNewlyChanged: true }),
      onboardingFormProgress: "COMPLETED",
    });
    renderStatefulDashboardComponent({ business });

    expect(screen.getByTestId("for-you-indicator")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("for-you-tab"));
    await waitFor(() => {
      return expect(screen.queryByTestId("for-you-indicator")).not.toBeInTheDocument();
    });
  });
});
