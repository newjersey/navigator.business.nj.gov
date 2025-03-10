import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import { ROUTES } from "@/lib/domain-logic/routes";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { generateAnytimeActionLicenseReinstatement, generateAnytimeActionTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { randomElementFromArray } from "@businessnjgovnavigator/shared/arrayHelpers";
import {
  generateLicenseData,
  generateLicenseDetails,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

import { taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/index";

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

describe("<AnytimeActionDropdown />", () => {
  let anytimeActionTasks: AnytimeActionTask[] = [];
  let anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement[] = [];

  const taskName = "some-task-name";
  const licenseReinstatementName = "some-license-reinstatement-name";

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
          category: ["Some Category"],
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

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />
      );
    };

    it("shows all task categories and elements", () => {
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByText("Some Category")).toBeInTheDocument();
      expect(screen.getByText("Reactivate My Expired Permit, License or Registration")).toBeInTheDocument();

      expect(screen.getByText(taskName)).toBeInTheDocument();
      expect(screen.getByText(licenseReinstatementName)).toBeInTheDocument();
    });

    it("groups tasks with the same category", () => {
      anytimeActionTasks = [
        generateAnytimeActionTask({
          name: "category-1-task-name-1",
          applyToAllUsers: true,
          category: ["Category 1"],
        }),
        generateAnytimeActionTask({
          name: "category-1-task-name-2",
          applyToAllUsers: true,
          category: ["Category 1"],
        }),
        generateAnytimeActionTask({
          name: "category-2-task-name",
          applyToAllUsers: true,
          category: ["Category 2"],
        }),
      ];
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      const category1Title = screen.getByText("Category 1");
      const category1Task1 = screen.getByText("category-1-task-name-1");
      const category1Task2 = screen.getByText("category-1-task-name-2");
      const category2Title = screen.getByText("Category 2");
      const category2Task = screen.getByText("category-2-task-name");
      expect(category1Title.compareDocumentPosition(category1Task1)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(category1Title.compareDocumentPosition(category1Task2)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(category2Title.compareDocumentPosition(category2Task)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("routes to actions/url and triggers analytics when internal task clicked", () => {
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-task-name"));
      fireEvent.click(screen.getByTestId("anytimeActionPrimaryButton"));
      expect(mockPush).toHaveBeenCalledWith(`${ROUTES.anytimeActions}/some-url`);
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
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

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-license-reinstatement-name"));
      fireEvent.click(screen.getByTestId("anytimeActionPrimaryButton"));
      expect(mockPush).toHaveBeenCalledWith(`${ROUTES.licenseReinstatement}/some-url`);
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
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
          category: ["Some Category"],
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

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />
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

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      const taskGeneral = screen.getByText("some-task-name");
      const taskLicenseReinstatement = screen.getByText("some-license-reinstatement-name");
      const tasklicenseReinstatementLast = screen.getByText("zzz-some-license-reinstatement-name");

      const categoryTitleReinstatements = screen.getByText(
        "Reactivate My Expired Permit, License or Registration"
      );
      const categoryTitleGeneral = screen.getByText("Some Category");

      expect(categoryTitleReinstatements.compareDocumentPosition(taskLicenseReinstatement)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(categoryTitleReinstatements.compareDocumentPosition(tasklicenseReinstatementLast)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(taskLicenseReinstatement.compareDocumentPosition(tasklicenseReinstatementLast)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );

      expect(tasklicenseReinstatementLast.compareDocumentPosition(categoryTitleGeneral)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );

      expect(categoryTitleGeneral.compareDocumentPosition(taskGeneral)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it.each([
      {
        taskOverrides: {
          name: "only-show-in-subtask-name",
          applyToAllUsers: true,
          category: ["Only Show in Subtask"],
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
        renderAnytimeActionDropdown();
        fireEvent.click(screen.getByLabelText("Open"));

        expect(!!screen.queryByText(taskOverrides.name)).toBe(isShown);
      }
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
      renderAnytimeActionDropdown();

      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.queryByText("license - hvac-reinstatement")).not.toBeInTheDocument();
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
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.queryByTestId("vacant-building-fire-permit-option")).not.toBeInTheDocument();

      useMockBusiness({
        profileData: generateProfileData({
          vacantPropertyOwner: true,
        }),
      });
      renderAnytimeActionDropdown();
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
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.queryByTestId("carnival-ride-supplemental-modification-option")).not.toBeInTheDocument();

      useMockBusiness({
        profileData: generateProfileData({
          carnivalRideOwningBusiness: true,
        }),
      });
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByTestId("carnival-ride-supplemental-modification-option")).toBeInTheDocument();
    });

    it("adds operating carnival fire permit for carnvial owning businesses", () => {
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
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.queryByTestId("operating-carnival-fire-permit-option")).not.toBeInTheDocument();

      useMockBusiness({
        profileData: generateProfileData({
          carnivalRideOwningBusiness: true,
          travelingCircusOrCarnivalOwningBusiness: false,
        }),
      });
      renderAnytimeActionDropdown();
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
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.queryByTestId("operating-carnival-fire-permit-option")).not.toBeInTheDocument();

      useMockBusiness({
        profileData: generateProfileData({
          carnivalRideOwningBusiness: false,
          travelingCircusOrCarnivalOwningBusiness: true,
        }),
      });
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(screen.getByTestId("operating-carnival-fire-permit-option")).toBeInTheDocument();
    });
  });
});
