import { BusinessStructure } from "@/components/data-fields/BusinessStructure";
import { getMergedConfig } from "@/contexts/configContext";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
const Config = getMergedConfig();

const renderComponent = (business: Business): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <WithStatefulProfileData initialData={business.profileData}>
          <BusinessStructure />
        </WithStatefulProfileData>
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const configForField = Config.profileDefaults.fields.legalStructureId.default;

describe("<BusinessStructure />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  it(`add text is displayed with href that routes to business structure URL`, () => {
    useMockRoadmapTask({ id: "business-structure", urlSlug: "some-business-structure-url" });
    renderComponent(
      generateBusiness({
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
      generateBusiness({
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
      generateBusiness({
        profileData: generateProfileData({ legalStructureId: undefined }),
      })
    );
    expect(screen.getByText(configForField.notEnteredText)).toBeInTheDocument();
  });

  it("displays business structure when exists", () => {
    renderComponent(
      generateBusiness({
        profileData: generateProfileData({ legalStructureId: "c-corporation" }),
      })
    );
    expect(screen.queryByTestId("not-entered")).not.toBeInTheDocument();
    expect(screen.getByText(LookupLegalStructureById("c-corporation").name)).toBeInTheDocument();
  });
});
