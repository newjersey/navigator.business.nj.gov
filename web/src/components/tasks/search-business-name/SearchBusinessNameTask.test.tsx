import { SearchBusinessNameTask } from "@/components/tasks/search-business-name/SearchBusinessNameTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import { fillText, searchAndGetValue } from "@/test/helpers/helpersSearchBusinessName";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  searchBusinessName: jest.fn(),
}));

const Config = getMergedConfig();

describe("<SearchBusinessNameTask />", () => {
  const task = generateTask({ id: "search-business-name" });

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const renderPage = (businessName = ""): void => {
    const business = generateBusiness({
      profileData: generateProfileData({ businessName }),
    });
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
          <SearchBusinessNameTask task={task} />
        </WithStatefulUserData>,
        IsAuthenticated.TRUE,
      ),
    );
  };

  it("renders the search button", () => {
    renderPage();
    expect(screen.getByText(Config.searchBusinessNameTask.searchButtonText)).toBeInTheDocument();
  });

  it("pre-fills the input with profileData.businessName", () => {
    renderPage("Best Pizza");
    const input = screen.getByLabelText("Search business name") as HTMLInputElement;
    expect(input.value).toBe("Best Pizza");
  });

  it("shows the available alert after a successful search", async () => {
    renderPage();
    fillText("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
  });

  it("shows the unavailable alert when name is taken", async () => {
    renderPage();
    fillText("Taken Name");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
  });

  it("marks task as COMPLETED when name is available", async () => {
    renderPage();
    fillText("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(currentBusiness().taskProgress["search-business-name"]).toBe("COMPLETED");
  });

  it("does not mark task as COMPLETED when name is unavailable", async () => {
    renderPage();
    fillText("Taken Name");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(currentBusiness().taskProgress["search-business-name"]).not.toBe("COMPLETED");
  });
});
