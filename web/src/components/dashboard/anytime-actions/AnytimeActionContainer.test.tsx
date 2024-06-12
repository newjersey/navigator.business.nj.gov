import { AnytimeActionContainer } from "@/components/dashboard/anytime-actions/AnytimeActionContainer";
import { AnytimeActionLicenseReinstatement, AnytimeActionLink, AnytimeActionTask } from "@/lib/types/types";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionLink,
  generateAnytimeActionTask,
} from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateLicenseData, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const renderAnytimeActions = ({
  tasks,
  links,
  licenses,
}: {
  tasks?: AnytimeActionTask[];
  links?: AnytimeActionLink[];
  licenses?: AnytimeActionLicenseReinstatement[];
}): void => {
  render(
    <AnytimeActionContainer
      anytimeActionTasks={tasks || []}
      anytimeActionLinks={links || []}
      anytimeActionLicenseReinstatements={licenses || []}
    />
  );
};

describe("<AnytimeActionContainer />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  it("renders task and link when apply to all value is true", () => {
    const tasks = [
      generateAnytimeActionTask({
        applyToAllUsers: true,
        name: "task - match",
      }),
      generateAnytimeActionTask({
        applyToAllUsers: false,
        name: "task - no match",
      }),
    ];

    const links = [
      generateAnytimeActionLink({
        applyToAllUsers: true,
        name: "link - match",
      }),
      generateAnytimeActionLink({
        applyToAllUsers: false,
        name: "link - no match",
      }),
    ];
    renderAnytimeActions({ tasks, links });
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders task and link when industry is a match", () => {
    useMockBusiness({
      profileData: generateProfileData({
        industryId: "accounting",
      }),
    });

    const tasks = [
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

    const links = [
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
    renderAnytimeActions({ tasks, links });
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders task and link when sector is a match", () => {
    useMockBusiness({
      profileData: generateProfileData({
        sectorId: "accounting",
      }),
    });

    const tasks = [
      generateAnytimeActionTask({
        sectorIds: ["accounting"],
        applyToAllUsers: false,
        name: "task - match",
      }),
      generateAnytimeActionTask({
        sectorIds: ["real estate"],
        applyToAllUsers: false,
        name: "task - no match",
      }),
    ];

    const links = [
      generateAnytimeActionLink({
        sectorIds: ["accounting"],
        applyToAllUsers: false,
        name: "link - match",
      }),
      generateAnytimeActionLink({
        sectorIds: ["real estate"],
        applyToAllUsers: false,
        name: "link - no match",
      }),
    ];
    renderAnytimeActions({ tasks, links });
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("anytime-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders muitiple tasks and links", () => {
    useMockBusiness({
      profileData: generateProfileData({
        sectorId: "accountingSector",
        industryId: "accountingIndustry",
      }),
    });

    const tasks = [
      generateAnytimeActionTask({
        sectorIds: ["accountingSector"],
        applyToAllUsers: false,
        name: "task - sector match",
      }),
      generateAnytimeActionTask({
        industryIds: ["accountingIndustry"],
        applyToAllUsers: false,
        name: "task - industry match",
      }),
    ];

    const links = [
      generateAnytimeActionLink({
        sectorIds: ["accountingSector"],
        applyToAllUsers: false,
        name: "link - sector match",
      }),
      generateAnytimeActionLink({
        industryIds: ["accountingIndustry"],
        applyToAllUsers: false,
        name: "link - industry match",
      }),
    ];
    renderAnytimeActions({ tasks, links });
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("task - sector match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("task - industry match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("link - sector match");
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("link - industry match");
  });

  it("renders license reinstatment anytime action when industry matches, and license is expired", () => {
    useMockBusiness({
      profileData: generateProfileData({
        industryId: "hvac-contractor",
      }),
      licenseData: generateLicenseData({
        status: "EXPIRED",
      }),
    });
    const licenses = [
      generateAnytimeActionLicenseReinstatement({
        industryIds: ["hvac-contractor"],
        applyToAllUsers: false,
        name: "license - hvac-reinstatment",
      }),
    ];
    renderAnytimeActions({ licenses });
    expect(screen.getByTestId("anytime-actions-section")).toHaveTextContent("license - hvac-reinstatment");
  });

  it("does NOT renders license reinstatment anytime action when industry matches, and license is NOT expired", () => {
    useMockBusiness({
      profileData: generateProfileData({
        industryId: "hvac-contractor",
      }),
      licenseData: generateLicenseData({
        status: "PENDING_RENEWAL",
      }),
    });
    const licenses = [
      generateAnytimeActionLicenseReinstatement({
        industryIds: ["hvac-contractor"],
        applyToAllUsers: false,
        name: "license - hvac-reinstatment",
      }),
    ];
    renderAnytimeActions({ licenses });
    expect(screen.queryByTestId("anytime-actions-section")).not.toHaveTextContent(
      "license - hvac-reinstatment"
    );
  });

  it("does NOT renders license reinstatment anytime action when industry does NOT matches, and license is expired", () => {
    useMockBusiness({
      profileData: generateProfileData({
        industryId: "accounting",
      }),
      licenseData: generateLicenseData({
        status: "EXPIRED",
      }),
    });
    const licenses = [
      generateAnytimeActionLicenseReinstatement({
        industryIds: ["hvac-contractor"],
        applyToAllUsers: false,
        name: "license - hvac-reinstatment",
      }),
    ];
    renderAnytimeActions({ licenses });
    expect(screen.queryByTestId("anytime-actions-section")).not.toHaveTextContent(
      "license - hvac-reinstatment"
    );
  });
});
