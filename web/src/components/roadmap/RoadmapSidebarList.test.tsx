import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoadmapSidebarList } from "./RoadmapSidebarList";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<RoadmapSidebarCard />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  it("shows graduation card when business persona is STARTING", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "STARTING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    render(<RoadmapSidebarList sidebarDisplayContent={graduationCard} />);
    expect(screen.getByTestId("graduation")).toBeInTheDocument();
  });

  it("shows graduation card when business persona is OWNING", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "OWNING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    render(<RoadmapSidebarList sidebarDisplayContent={graduationCard} />);
    expect(screen.getByTestId("graduation")).toBeInTheDocument();
  });

  it("does not show graduation card when business persona is FOREIGN", async () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "FOREIGN" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    const userData = generateUserData({ profileData, preferences });

    render(
      <WithStatefulUserData initialUserData={userData}>
        <RoadmapSidebarList sidebarDisplayContent={graduationCard} />
      </WithStatefulUserData>
    );
    expect(screen.queryByTestId("graduation")).not.toBeInTheDocument();
  });

  it("shows graduation modal when graduation card cta button is clicked", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "OWNING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    render(<RoadmapSidebarList sidebarDisplayContent={graduationCard} />);
    fireEvent.click(screen.getByTestId("cta-graduation"));

    expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
  });
});
