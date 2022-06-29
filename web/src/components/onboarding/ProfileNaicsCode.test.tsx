import { ProfileNaicsCode } from "@/components/onboarding/ProfileNaicsCode";
import { getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { generateProfileData } from "@/test/factories";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { render, screen } from "@testing-library/react";
import removeMd from "remove-markdown";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
const Config = getMergedConfig();

const renderComponent = (profileData: Partial<ProfileData>) => {
  const data = generateProfileData({
    businessPersona: "STARTING",
    ...profileData,
  });
  render(
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: data,
          flow: getFlow(data),
          municipalities: [],
        },
        setProfileData: () => {},
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <ProfileNaicsCode />
    </ProfileDataContext.Provider>
  );
};

describe("<ProfileNaicsCode />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  it("routes to naics code URL", () => {
    useMockRoadmapTask({ id: "determine-naics-code", urlSlug: "some-naics-url" });
    renderComponent({});
    expect(screen.getByText(Config.profileDefaults.STARTING.naicsCode.editText)).toHaveAttribute(
      "href",
      "/tasks/some-naics-url"
    );
  });

  it("displays Not Entered text when user has no NAICS code", () => {
    renderComponent({ naicsCode: "" });
    expect(
      screen.getByText(removeMd(Config.profileDefaults.STARTING.naicsCode.notEnteredText))
    ).toBeInTheDocument();
  });

  it("displays NAICS code when exists", () => {
    renderComponent({ naicsCode: "123456" });
    expect(
      screen.queryByText(removeMd(Config.profileDefaults.STARTING.naicsCode.notEnteredText))
    ).not.toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
  });
});
