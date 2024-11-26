import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import { ROUTES } from "@/lib/domain-logic/routes";
import { AnytimeActionLicenseReinstatement, AnytimeActionLink, AnytimeActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionLink,
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
import { fireEvent, render, screen } from "@testing-library/react";

import { getMergedConfig } from "@/contexts/configContext";
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

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<AnytimeActionDropdown />", () => {
  const Config = getMergedConfig();
  let anytimeActionLinks: AnytimeActionLink[] = [];

  let anytimeActionAdminTasks: AnytimeActionTask[] = [];

  let anytimeActionLicensesTasks: AnytimeActionTask[] = [];

  let anytimeActionReinstatementsTasks: AnytimeActionTask[] = [];

  let anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement[] = [];

  const TASK_NAMES = ["some-admin-task-name", "some-licenses-task-name", "some-reinstatements-task-name"];

  describe("routing and analytics", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      useMockBusiness({});
      anytimeActionLinks = [
        generateAnytimeActionLink({
          name: "some-link-name",
          externalRoute: "some-url",
          filename: "some-filename-link",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionAdminTasks = [
        generateAnytimeActionTask({
          name: "some-admin-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionLicensesTasks = [
        generateAnytimeActionTask({
          name: "some-licenses-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionReinstatementsTasks = [
        generateAnytimeActionTask({
          name: "some-reinstatements-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          name: "some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];
    });

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionLinks={anytimeActionLinks}
          anytimeActionAdminTasks={anytimeActionAdminTasks}
          anytimeActionReinstatementsTasks={anytimeActionReinstatementsTasks}
          anytimeActionLicensesTasks={anytimeActionLicensesTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />
      );
    };

    it("shows all task categories and elements", () => {
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      expect(
        screen.getByText(Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryAdmin)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryLicenses)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryReinstatements)
      ).toBeInTheDocument();

      expect(screen.getByText(TASK_NAMES[0])).toBeInTheDocument();
      expect(screen.getByText(TASK_NAMES[1])).toBeInTheDocument();
      expect(screen.getByText(TASK_NAMES[2])).toBeInTheDocument();
    });

    it("routes to actions/url and triggers analytics when external link clicked", () => {
      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-link-name"));
      fireEvent.click(screen.getByTestId("anytimeActionPrimaryButton"));
      expect(mockPush).toHaveBeenCalledWith("some-url");
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
      ).toHaveBeenCalledWith("some-filename-link");
    });

    it.each(TASK_NAMES)(
      "routes to actions/url and triggers analytics when internal task clicked",
      (taskName) => {
        renderAnytimeActionDropdown();
        fireEvent.click(screen.getByLabelText("Open"));
        fireEvent.click(screen.getByText(taskName));
        fireEvent.click(screen.getByTestId("anytimeActionPrimaryButton"));
        expect(mockPush).toHaveBeenCalledWith(`${ROUTES.anytimeActions}/some-url`);
        expect(
          mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
        ).toHaveBeenCalledWith("some-filename-task");
      }
    );

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
          name: "some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      fireEvent.click(screen.getByText("some-license-name"));
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
      anytimeActionLinks = [
        generateAnytimeActionLink({
          name: "some-link-name",
          externalRoute: "some-url",
          filename: "some-filename-link",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionAdminTasks = [
        generateAnytimeActionTask({
          name: "some-admin-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionLicensesTasks = [
        generateAnytimeActionTask({
          name: "some-licenses-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionReinstatementsTasks = [
        generateAnytimeActionTask({
          name: "some-reinstatements-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          name: "some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
      ];
    });

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionLinks={anytimeActionLinks}
          anytimeActionAdminTasks={anytimeActionAdminTasks}
          anytimeActionReinstatementsTasks={anytimeActionReinstatementsTasks}
          anytimeActionLicensesTasks={anytimeActionLicensesTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatement}
        />
      );
    };

    it("sorts all actions into correct order (categories are reverse alphabetical, items are alphabetical)", () => {
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
          name: "some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
          licenseName,
        }),
        generateAnytimeActionLicenseReinstatement({
          name: "zzz-some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license-zzz",
          licenseName,
        }),
      ];

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      const taskAdmin = screen.getByText("some-admin-task-name");
      const taskLicenses = screen.getByText("some-licenses-task-name");
      const taskReinstatements = screen.getByText("some-reinstatements-task-name");
      const licenseReinstatement = screen.getByText("some-license-name");
      const licenseReinstatementLast = screen.getByText("zzz-some-license-name");
      const link = screen.getByText("some-link-name");
      const categoryTitleAdmin = screen.getByText(
        Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryAdmin
      );
      const categoryTitleLicenses = screen.getByText(
        Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryLicenses
      );
      const categoryTitleReinstatements = screen.getByText(
        Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryReinstatements
      );

      expect(categoryTitleReinstatements.compareDocumentPosition(taskReinstatements)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(categoryTitleReinstatements.compareDocumentPosition(licenseReinstatement)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(categoryTitleReinstatements.compareDocumentPosition(licenseReinstatementLast)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(licenseReinstatement.compareDocumentPosition(taskReinstatements)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(taskReinstatements.compareDocumentPosition(licenseReinstatementLast)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );

      expect(categoryTitleLicenses.compareDocumentPosition(taskLicenses)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );

      expect(categoryTitleAdmin.compareDocumentPosition(taskAdmin)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(categoryTitleAdmin.compareDocumentPosition(link)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(taskAdmin.compareDocumentPosition(link)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("filters out licenses unrelated to user industry", () => {
      const validLicenseName = Object.values(taskIdLicenseNameMapping)[0];
      const invalidLicenseName = Object.values(taskIdLicenseNameMapping)[1];

      useMockBusiness({
        licenseData: generateLicenseData({
          licenses: {
            [validLicenseName]: generateLicenseDetails({
              licenseStatus: "EXPIRED",
            }),
          },
        }),
      });

      anytimeActionLicenseReinstatement = [
        generateAnytimeActionLicenseReinstatement({
          licenseName: validLicenseName,
          name: "hvac-contractor-reinstatement",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
        generateAnytimeActionLicenseReinstatement({
          licenseName: invalidLicenseName,
          name: "cannabis-license-reinstatement",
          urlSlug: "some-url",
          filename: "some-filename-license-zzz",
        }),
      ];

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.getByText("hvac-contractor-reinstatement")).toBeInTheDocument();
      expect(screen.queryByText("cannabis-license-reinstatement")).not.toBeInTheDocument();
    });

    it("renders task and link when industry is a match", () => {
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "accounting",
        }),
      });
      anytimeActionAdminTasks = [
        generateAnytimeActionTask({
          industryIds: ["accounting"],
          applyToAllUsers: false,
          name: "task - match",
        }),
        generateAnytimeActionTask({
          industryIds: ["real estate"],
          applyToAllUsers: false,
          name: "task - no match",
        }),
      ];
      anytimeActionLicensesTasks = [
        generateAnytimeActionTask({
          name: "some-licenses-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];
      anytimeActionReinstatementsTasks = [
        generateAnytimeActionTask({
          name: "some-reinstatements-task-name",
          urlSlug: "some-url",
          filename: "some-filename-task",
          applyToAllUsers: true,
        }),
      ];

      anytimeActionLinks = [
        generateAnytimeActionLink({
          industryIds: ["accounting"],
          applyToAllUsers: false,
          name: "link - match",
        }),
        generateAnytimeActionLink({
          industryIds: ["real estate"],
          applyToAllUsers: false,
          name: "link - no match",
        }),
      ];
      renderAnytimeActionDropdown();

      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.getByText("task - match")).toBeInTheDocument();
      expect(screen.queryByText("task - no match")).not.toBeInTheDocument();

      expect(screen.getByText("link - match")).toBeInTheDocument();
      expect(screen.queryByText("link - no match")).not.toBeInTheDocument();
    });

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
  });
});
