import { ProfileBusinessStructure } from "@/components/profile/ProfileBusinessStructure";
import { getMergedConfig } from "@/contexts/configContext";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateProfileData,
  generateUserData,
  LookupLegalStructureById,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
const Config = getMergedConfig();

const renderComponent = (userData?: UserData): void => {
  const data = userData || generateUserData({});

  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={data}>
        <WithStatefulProfileData initialData={data.profileData}>
          <ProfileBusinessStructure />
        </WithStatefulProfileData>
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const configForField = Config.profileDefaults.fields.legalStructureId.default;

describe("<ProfileBusinessStructure />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  it(`add text is displayed with href that routes to business structure URL`, () => {
    useMockRoadmapTask({ id: "business-structure", urlSlug: "some-business-structure-url" });
    renderComponent(
      generateUserData({
        profileData: generateProfileData({ legalStructureId: undefined }),
      })
    );

    expect(screen.getByText(configForField.addText)).toHaveAttribute(
      "href",
      "/tasks/some-business-structure-url"
    );
  });

  it(`edit text is displayed with href that routes to business structure URL`, () => {
    useMockRoadmapTask({ id: "business-structure", urlSlug: "some-business-structure-url" });
    renderComponent(
      generateUserData({
        profileData: generateProfileData({ legalStructureId: "c-corporation" }),
      })
    );
    expect(screen.getByText(configForField.editText)).toHaveAttribute(
      "href",
      "/tasks/some-business-structure-url"
    );
  });

  it("displays Not Entered text when user has no legal structure", () => {
    renderComponent(
      generateUserData({
        profileData: generateProfileData({ legalStructureId: undefined }),
      })
    );
    expect(screen.getByText(configForField.notEnteredText)).toBeInTheDocument();
  });

  it("displays business structure when exists", () => {
    renderComponent(
      generateUserData({
        profileData: generateProfileData({ legalStructureId: "c-corporation" }),
      })
    );
    expect(screen.queryByTestId("not-entered")).not.toBeInTheDocument();
    expect(screen.getByText(LookupLegalStructureById("c-corporation").name)).toBeInTheDocument();
  });
});
