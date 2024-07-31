import { AnytimeActionDropdown } from "@/components/dashboard/anytime-actions/AnytimeActionDropdown";
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
import { generateLicenseData, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

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

let anytimeActionLinks: AnytimeActionLink[] = [
  generateAnytimeActionLink({
    name: "some-link-name",
    externalRoute: "some-url",
    filename: "some-filename-link",
    applyToAllUsers: true,
  }),
];

let anytimeActionTasks: AnytimeActionTask[] = [
  generateAnytimeActionTask({
    name: "some-task-name",
    urlSlug: "some-url",
    filename: "some-filename-task",
    applyToAllUsers: true,
  }),
];

let anytimeActionLicense: AnytimeActionLicenseReinstatement[] = [
  generateAnytimeActionLicenseReinstatement({
    name: "some-license-name",
    urlSlug: "some-url",
    filename: "some-filename-license",
    applyToAllUsers: true,
  }),
];

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<AnytimeActionDropdown />", () => {
  describe("routing and analytics", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      useMockBusiness({});
    });

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionLinks={anytimeActionLinks}
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicense}
        />
      );
    };

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
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "hvac-contractor",
        }),
        licenseData: generateLicenseData({
          status: "EXPIRED",
        }),
      });
      anytimeActionLicense = [
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
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
    });

    const renderAnytimeActionDropdown = (): void => {
      render(
        <AnytimeActionDropdown
          anytimeActionLinks={anytimeActionLinks}
          anytimeActionTasks={anytimeActionTasks}
          anytimeActionLicenseReinstatements={anytimeActionLicense}
        />
      );
    };

    it("sorts all actions by name", () => {
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "hvac-contractor",
        }),
        licenseData: generateLicenseData({
          status: "EXPIRED",
        }),
      });
      anytimeActionLicense = [
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
          name: "some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
          name: "zzz-some-license-name",
          urlSlug: "some-url",
          filename: "some-filename-license-zzz",
        }),
      ];

      renderAnytimeActionDropdown();
      fireEvent.click(screen.getByLabelText("Open"));
      const task = screen.getByText("some-task-name");
      const license = screen.getByText("some-license-name");
      const licenseLast = screen.getByText("zzz-some-license-name");
      const link = screen.getByText("some-link-name");

      expect(license.compareDocumentPosition(link)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(link.compareDocumentPosition(task)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(task.compareDocumentPosition(licenseLast)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("filters out licenses unrelated to user industry", () => {
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "hvac-contractor",
        }),
        licenseData: generateLicenseData({
          status: "EXPIRED",
        }),
      });
      anytimeActionLicense = [
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
          name: "hvac-contractor-reinstatement",
          urlSlug: "some-url",
          filename: "some-filename-license",
        }),
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["cannabis"],
          applyToAllUsers: false,
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
      anytimeActionTasks = [
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

    it("does NOT renders license reinstatement anytime action when industry matches, and license is NOT expired", () => {
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "hvac-contractor",
        }),
        licenseData: generateLicenseData({
          status: "PENDING_RENEWAL",
        }),
      });
      anytimeActionLicense = [
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
          name: "license - hvac-reinstatement",
        }),
      ];
      renderAnytimeActionDropdown();

      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.queryByText("license - hvac-reinstatement")).not.toBeInTheDocument();
    });

    it("does NOT renders license reinstatement anytime action when industry does NOT matches, and license is expired", () => {
      useMockBusiness({
        profileData: generateProfileData({
          industryId: "accounting",
        }),
        licenseData: generateLicenseData({
          status: "EXPIRED",
        }),
      });
      anytimeActionLicense = [
        generateAnytimeActionLicenseReinstatement({
          industryIds: ["hvac-contractor"],
          applyToAllUsers: false,
          name: "license - hvac-reinstatement",
        }),
      ];
      renderAnytimeActionDropdown();

      fireEvent.click(screen.getByLabelText("Open"));

      expect(screen.queryByText("license - hvac-reinstatement")).not.toBeInTheDocument();
    });
  });
});
