import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionTask,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { randomElementFromArray } from "@businessnjgovnavigator/shared/arrayHelpers";
import {
  generateLicenseData,
  generateLicenseDetails,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types";
import { fireEvent, render, screen } from "@testing-library/react";

import { AnytimeActionSearch } from "@/components/dashboard/AnytimeActionSearch";
import { taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/index";
import userEvent from "@testing-library/user-event";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      anytime_action_button: {
        click: {
          go_to_anytime_action_screen: jest.fn(),
        },
      },
    },
  };
}

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<AnytimeActionSearch />", () => {
  let anytimeActionTasks: AnytimeActionTask[] = [];
  let anytimeActionTasksFromNonEssentialQuestions: AnytimeActionTask[] = [];
  let anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement[] = [];

  const taskName = "some-task-name";
  const licenseReinstatementName = "some-license-reinstatement-name";

  const anytimeActionTasksAlternate = [
    generateAnytimeActionTask({
      name: "test-title-1",
      applyToAllUsers: true,
      category: [{ categoryName: "Category 1", categoryId: "category-1" }],
      description: "test-description-1",
    }),
    generateAnytimeActionTask({
      name: "test-title-2",
      applyToAllUsers: true,
      category: [{ categoryName: "Category 1", categoryId: "category-1" }],
      description: "test-description-2",
    }),
    generateAnytimeActionTask({
      name: "test-title-3",
      applyToAllUsers: true,
      category: [{ categoryName: "Category 3", categoryId: "category-3" }],
      description: "test-description-3",
    }),
  ];

  describe("routing and analytics", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

      useMockBusiness({
        licenseData: generateLicenseData({
          licenses: {
            [licenseName]: generateLicenseDetails({
              licenseStatus: "EXPIRED",
            }),
          },
        }),
      });

      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "some-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
          category: [{ categoryName: "Some Category", categoryId: "some-category" }],
        }),
      ];
      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          name: licenseReinstatementName,
          licenseName,
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];
    });

    const renderAnytimeActionSearch = (): void => {
      render(
        <AnytimeActionSearch
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionTasksFromNonEssentialQuestions={anytimeActionTasksFromNonEssentialQuestions}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />,
      );
    };

    it("shows all task categories and elements", () => {
      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByText("Some Category")).toBeInTheDocument();
      expect(
        screen.getByText("Reactivate My Expired Permit, License or Registration"),
      ).toBeInTheDocument();

      expect(screen.getByText(taskName)).toBeInTheDocument();
      expect(screen.getByText(licenseReinstatementName)).toBeInTheDocument();
    });

    it("groups tasks with the same category", () => {
      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "category-1-task-name-1",
          applyToAllUsers: true,
          category: [{ categoryName: "Category 1", categoryId: "category-1" }],
        }),
        generateAnytimeActionTask({
          name: "category-1-task-name-2",
          applyToAllUsers: true,
          category: [{ categoryName: "Category 1", categoryId: "category-1" }],
        }),
        generateAnytimeActionTask({
          name: "category-2-task-name",
          applyToAllUsers: true,
          category: [{ categoryName: "Category 2", categoryId: "category-2" }],
        }),
      ];
      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      const category1Title = screen.getByText("Category 1");
      const category1Task1 = screen.getByText("category-1-task-name-1");
      const category1Task2 = screen.getByText("category-1-task-name-2");
      const category2Title = screen.getByText("Category 2");
      const category2Task = screen.getByText("category-2-task-name");
      expect(category1Title.compareDocumentPosition(category1Task1)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(category1Title.compareDocumentPosition(category1Task2)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(category2Title.compareDocumentPosition(category2Task)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it("routes to actions/url and triggers analytics when internal task clicked", () => {
      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-task-name"));
      expect(mockPush).toHaveBeenCalledWith(`${ROUTES.anytimeActions}/some-url`);
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen,
      ).toHaveBeenCalledWith("some-filename-task");
    });

    it("routes to actions/url and triggers analytics when internal license reinstatement clicked", () => {
      const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

      useMockBusiness({
        licenseData: generateLicenseData({
          licenses: {
            [licenseName]: generateLicenseDetails({
              licenseStatus: "EXPIRED",
            }),
          },
        }),
      });
      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          licenseName,
          name: "some-license-reinstatement-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-license-reinstatement-name"));
      expect(mockPush).toHaveBeenCalledWith(`${ROUTES.licenseReinstatement}/some-url`);
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen,
      ).toHaveBeenCalledWith("some-filename-license");
    });
  });

  describe("filtering and sorting", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      useMockBusiness({});
      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "some-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
          category: [{ categoryName: "Some Category", categoryId: "some-category" }],
        }),
      ];
      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          name: "some-license-reinstatement-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];
    });

    const renderAnytimeActionSearch = (): void => {
      render(
        <AnytimeActionSearch
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionTasksFromNonEssentialQuestions={anytimeActionTasksFromNonEssentialQuestions}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />,
      );
    };

    it("sorts all tasks within the correct categories in the correct order (categories are reverse alphabetical,  tasks are alphabetical)", () => {
      const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

      useMockBusiness({
        licenseData: generateLicenseData({
          licenses: {
            [licenseName]: generateLicenseDetails({
              licenseStatus: "EXPIRED",
            }),
          },
        }),
      });

      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          name: "some-license-reinstatement-name",
          licenseName,
        }),
        generateAnytimeActionLicenseReinstatement({
          name: "zzz-some-license-reinstatement-name",
          licenseName,
        }),
      ];

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      const taskGeneral = screen.getByText("some-task-name");
      const taskLicenseReinstatement = screen.getByText("some-license-reinstatement-name");
      const tasklicenseReinstatementLast = screen.getByText("zzz-some-license-reinstatement-name");

      const categoryTitleReinstatements = screen.getByText(
        "Reactivate My Expired Permit, License or Registration",
      );
      const categoryTitleGeneral = screen.getByText("Some Category");

      expect(categoryTitleReinstatements.compareDocumentPosition(taskLicenseReinstatement)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(
        categoryTitleReinstatements.compareDocumentPosition(tasklicenseReinstatementLast),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(taskLicenseReinstatement.compareDocumentPosition(tasklicenseReinstatementLast)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );

      expect(tasklicenseReinstatementLast.compareDocumentPosition(categoryTitleGeneral)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );

      expect(categoryTitleGeneral.compareDocumentPosition(taskGeneral)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it.each([
      {
        taskOverrides: {
          name: "only-show-in-subtask-name",
          applyToAllUsers: true,
          category: [{ categoryName: "Only Show in Subtask", categoryId: "only-show-in-subtask" }],
        },
        businessProfileDataOverrides: {},
        isShown: false,
      },
      {
        taskOverrides: {
          name: "apply-to-all-users-name",
          applyToAllUsers: true,
        },
        businessProfileDataOverrides: {},
        isShown: true,
      },
      {
        taskOverrides: {
          name: "matching-industry-name",
          industryIds: ["accounting"],
        },
        businessProfileDataOverrides: {
          industryId: "accounting",
        },
        isShown: true,
      },
      {
        taskOverrides: {
          name: "non-matching-industry-name",
          industryIds: ["accounting"],
        },
        businessProfileDataOverrides: {
          industryId: "non-matching-industry",
        },
        isShown: false,
      },
      {
        taskOverrides: {
          name: "matching-sector-name",
          sectorIds: ["clean-energy"],
        },
        businessProfileDataOverrides: {
          sectorId: "clean-energy",
        },
        isShown: true,
      },
      {
        taskOverrides: {
          name: "non-matching-sector-name",
          sectorIds: ["clean-energy"],
        },
        businessProfileDataOverrides: {
          sectorId: "non-matching-sector-id",
        },
        isShown: false,
      },
      {
        taskOverrides: {
          name: "doesnt-match-anything-name",
          filename: "doesnt-match-anything-filename",
        },
        businessProfileDataOverrides: {},
        isShown: false,
      },
    ])(
      "only shows tasks that match the business: $taskOverrides.name - shown $isShown",
      ({ taskOverrides, businessProfileDataOverrides, isShown }) => {
        useMockBusiness({
          profileData: generateProfileData(businessProfileDataOverrides),
        });
        anytimeActionTasks = [generateAnytimeActionTask(taskOverrides)];
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));

        expect(!!screen.queryByText(taskOverrides.name)).toBe(isShown);
      },
    );

    it("does NOT renders license reinstatement anytime action when license is NOT expired", () => {
      const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

      useMockBusiness({
        licenseData: generateLicenseData({
          licenses: {
            [licenseName]: generateLicenseDetails({
              licenseStatus: "PENDING_RENEWAL",
            }),
          },
        }),
      });

      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          licenseName,
          name: "license - hvac-reinstatement",
        }),
      ];
      renderAnytimeActionSearch();

      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.queryByText("license - hvac-reinstatement")).not.toBeInTheDocument();
    });

    describe("non essential questions", () => {
      it("duplicate Anytime Actions added via non-essential questions are removed", () => {
        const duplicateAnytimeAction = generateAnytimeActionTask({
          filename: "same-anytime-action",
          name: "same-anytime-action",
        });

        anytimeActionTasks = [duplicateAnytimeAction, ...anytimeActionTasks];
        anytimeActionTasksFromNonEssentialQuestions = [duplicateAnytimeAction];

        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.getAllByText("same-anytime-action").length).toBe(1);
      });

      it("adds vacant property anytime action for vacant property owners", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "vacant-building-fire-permit" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            vacantPropertyOwner: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.queryByTestId("vacant-building-fire-permit-option")).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            vacantPropertyOwner: true,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.getByTestId("vacant-building-fire-permit-option")).toBeInTheDocument();
      });

      it("adds fire carnival modification for carnival ride owning businesses", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "carnival-ride-supplemental-modification" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.queryByTestId("carnival-ride-supplemental-modification-option"),
        ).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: true,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.getByTestId("carnival-ride-supplemental-modification-option"),
        ).toBeInTheDocument();
      });

      it("adds operating carnival fire permit for carnival owning businesses", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "operating-carnival-fire-permit" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.queryByTestId("operating-carnival-fire-permit-option"),
        ).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: true,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.getByTestId("operating-carnival-fire-permit-option")).toBeInTheDocument();
      });

      it("adds operating carnival fire permit for traveling circus or carnival owning businesses", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "operating-carnival-fire-permit" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.queryByTestId("operating-carnival-fire-permit-option"),
        ).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: true,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.getByTestId("operating-carnival-fire-permit-option")).toBeInTheDocument();
      });

      it("adds operating carnival fire permit for traveling circus or carnival owning businesses based on non-essential question answers", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "operating-carnival-fire-permit" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            nonEssentialRadioAnswers: {
              "carnival-fire-licenses": false,
              "carnival-ride-permitting": false,
            },
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.queryByTestId("operating-carnival-fire-permit-option"),
        ).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            nonEssentialRadioAnswers: {
              "carnival-fire-licenses": true,
              "carnival-ride-permitting": false,
            },
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(screen.getByTestId("operating-carnival-fire-permit-option")).toBeInTheDocument();
      });

      it("adds carnival ride supplemental modification for traveling circus or carnival owning businesses based on non-essential question answers", () => {
        anytimeActionTasks = [
          generateAnytimeActionTask({ filename: "carnival-ride-supplemental-modification" }),
          ...anytimeActionTasks,
        ];
        useMockBusiness({
          profileData: generateProfileData({
            nonEssentialRadioAnswers: {
              "carnival-ride-permitting": false,
              "carnival-fire-licenses": false,
            },
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.queryByTestId("carnival-ride-supplemental-modification-option"),
        ).not.toBeInTheDocument();

        useMockBusiness({
          profileData: generateProfileData({
            nonEssentialRadioAnswers: {
              "carnival-ride-permitting": true,
              "carnival-fire-licenses": false,
            },
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: false,
          }),
        });
        renderAnytimeActionSearch();
        fireEvent.click(screen.getByLabelText("Open"));
        expect(
          screen.getByTestId("carnival-ride-supplemental-modification-option"),
        ).toBeInTheDocument();
      });
    });

    it("renders an anytime action with a description", () => {
      const testDescription = "test-description-1";

      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "test-title-1",
          applyToAllUsers: true,
          category: [{ categoryName: "Category 1", categoryId: "category-1" }],
          description: testDescription,
        }),
      ];
      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByText(testDescription)).toBeInTheDocument();
    });

    it("renders an anytime actions that match search value to a title with correct bolding", async () => {
      anytimeActionTasks = anytimeActionTasksAlternate;

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      await userEvent.type(screen.getByRole("combobox"), "test-title-3");
      expect(screen.getByText("test-title-3")).toBeInTheDocument();
      expect(screen.getByText("test-title-3")).toHaveClass("text-bold");
      expect(screen.getByText("Category 3")).toBeInTheDocument();
      expect(screen.queryByText("test-title-2")).not.toBeInTheDocument();
      expect(screen.queryByText("test-title-1")).not.toBeInTheDocument();
      expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
    });

    it("returns no searched elements when nothing matches", async () => {
      anytimeActionTasks = anytimeActionTasksAlternate;

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByText("test-title-3")).toBeInTheDocument();
      expect(screen.getByText("Category 3")).toBeInTheDocument();
      expect(screen.getByText("test-title-2")).toBeInTheDocument();
      expect(screen.getByText("test-title-1")).toBeInTheDocument();
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      expect(screen.queryByText("No options")).not.toBeInTheDocument();
      await userEvent.type(screen.getByRole("combobox"), "test-title-33333");
      expect(screen.queryByText("test-title-3")).not.toBeInTheDocument();
      expect(screen.queryByText("Category 3")).not.toBeInTheDocument();
      expect(screen.queryByText("test-title-2")).not.toBeInTheDocument();
      expect(screen.queryByText("test-title-1")).not.toBeInTheDocument();
      expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
      expect(screen.getByText("No options")).toBeInTheDocument();
    });

    it("renders an anytime actions that match search value to a description with correct bolding", async () => {
      anytimeActionTasks = anytimeActionTasksAlternate;

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      await userEvent.type(screen.getByRole("combobox"), "test-description-3");
      expect(screen.getByText("test-description-3")).toBeInTheDocument();
      expect(screen.getByText("test-description-3")).toHaveClass("text-bold");
      expect(screen.getByText("Category 3")).toBeInTheDocument();
      expect(screen.queryByText("test-description-2")).not.toBeInTheDocument();
      expect(screen.queryByText("test-description-1")).not.toBeInTheDocument();
      expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
    });

    it("matches search for synonyms for anytime action", async () => {
      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "task-1",
          synonyms: ["Particular search"],
          applyToAllUsers: true,
        }),
        generateAnytimeActionTask({ name: "task-2", applyToAllUsers: true }),
      ];

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      await userEvent.type(screen.getByRole("combobox"), "particular");
      expect(screen.getByText("task-1")).toBeInTheDocument();
      expect(screen.queryByText("task-2")).not.toBeInTheDocument();
    });

    it("matches search for multiple synonyms for anytime action", async () => {
      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "task-1",
          synonyms: ["Particular search", "crazy search"],
          applyToAllUsers: true,
        }),
        generateAnytimeActionTask({
          name: "task-2",
          synonyms: ["crazy search"],
          applyToAllUsers: true,
        }),
      ];

      renderAnytimeActionSearch();
      fireEvent.click(screen.getByLabelText("Open"));
      await userEvent.type(screen.getByRole("combobox"), "particular");
      expect(screen.getByText("task-1")).toBeInTheDocument();
      expect(screen.queryByText("task-2")).not.toBeInTheDocument();

      await userEvent.clear(screen.getByRole("combobox"));
      await userEvent.type(screen.getByRole("combobox"), "crazy");
      expect(screen.getByText("task-1")).toBeInTheDocument();
      expect(screen.getByText("task-2")).toBeInTheDocument();
    });
  });
});
