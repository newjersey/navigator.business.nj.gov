import { ProfileBusinessStructure } from "@/components/profile/ProfileBusinessStructure";
import { getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { generateProfileData, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
const Config = getMergedConfig();

const renderComponent = (profileData: Partial<ProfileData>): void => {
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
        },
        setProfileData: (): void => {},
        setUser: (): void => {},
        onBack: (): void => {},
      }}
    >
      <ProfileBusinessStructure />
    </ProfileDataContext.Provider>
  );
};

const configForField = Config.profileDefaults.fields.legalStructureId.default;

describe("<ProfileBusinessStructure />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  it(`add text is displayed with href that routes to business structure URL`, () => {
    useMockRoadmapTask({ id: "business-structure", urlSlug: "some-business-structure-url" });
    renderComponent({ legalStructureId: undefined });
    expect(screen.getByText(configForField.addText)).toHaveAttribute(
      "href",
      "/tasks/some-business-structure-url"
    );
  });

  it(`edit text is displayed with href that routes to business structure URL`, () => {
    useMockRoadmapTask({ id: "business-structure", urlSlug: "some-business-structure-url" });
    renderComponent({ legalStructureId: "corporation" });
    expect(screen.getByText(configForField.editText)).toHaveAttribute(
      "href",
      "/tasks/some-business-structure-url"
    );
  });

  it("displays Not Entered text when user has no NAICS code", () => {
    renderComponent({ legalStructureId: undefined });
    expect(screen.getByTestId("not-entered")).toBeInTheDocument();
  });

  it("displays business structure when exists", () => {
    renderComponent({ legalStructureId: "c-corporation" });
    expect(screen.queryByTestId("not-entered")).not.toBeInTheDocument();
    expect(screen.getByText(LookupLegalStructureById("c-corporation").name)).toBeInTheDocument();
  });
});
