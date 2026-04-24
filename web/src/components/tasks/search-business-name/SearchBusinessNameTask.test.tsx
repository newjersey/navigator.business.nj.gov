import { SearchBusinessNameTask } from "@/components/tasks/search-business-name/SearchBusinessNameTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateTask } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import { fillText, searchAndGetValue } from "@/test/helpers/helpersSearchBusinessName";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

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

  const fillBothFields = (name: string): void => {
    fillText(name);
    fireEvent.change(screen.getByLabelText("Confirm business name"), { target: { value: name } });
  };

  it("renders the search button", () => {
    renderPage();
    expect(screen.getByText(Config.searchBusinessNameTask.searchButtonText)).toBeInTheDocument();
  });

  it("renders the confirm business name input", () => {
    renderPage();
    expect(screen.getByLabelText("Confirm business name")).toBeInTheDocument();
  });

  it("pre-fills the input with profileData.businessName", () => {
    renderPage("Best Pizza");
    const input = screen.getByLabelText("Search business name") as HTMLInputElement;
    expect(input.value).toBe("Best Pizza");
  });

  it("shows the available alert after a successful search", async () => {
    renderPage();
    fillBothFields("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
  });

  it("shows the unavailable alert when name is taken", async () => {
    renderPage();
    fillBothFields("Taken Name");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
  });

  it("save button is disabled initially", () => {
    renderPage();
    expect(screen.getByTestId("save-business-name")).toBeDisabled();
  });

  it("save button is disabled when name is unavailable", async () => {
    renderPage();
    fillBothFields("Taken Name");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("save-business-name")).toBeDisabled();
  });

  it("save button is enabled when name is available", async () => {
    renderPage();
    fillBothFields("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(screen.getByTestId("save-business-name")).toBeEnabled();
  });

  it("does not mark task as COMPLETED when name is available but save has not been clicked", async () => {
    renderPage();
    fillBothFields("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(userDataWasNotUpdated()).toBe(true);
  });

  it("marks task as COMPLETED when save is clicked after finding an available name", async () => {
    renderPage();
    fillBothFields("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    fireEvent.click(screen.getByTestId("save-business-name"));
    expect(currentBusiness().taskProgress["search-business-name"]).toBe("COMPLETED");
  });

  it("saves the business name to profile when save is clicked", async () => {
    renderPage();
    fillBothFields("Best Pizza LLC");
    await searchAndGetValue({ status: "AVAILABLE" });
    fireEvent.click(screen.getByTestId("save-business-name"));
    expect(currentBusiness().profileData.businessName).toBe("Best Pizza LLC");
  });

  it("does not mark task as COMPLETED when name is unavailable", async () => {
    renderPage();
    fillBothFields("Taken Name");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(userDataWasNotUpdated()).toBe(true);
  });

  it("renders the name reservation section from the formation name step", () => {
    renderPage();
    expect(screen.getByText(Config.formation.checkNameReservation.header)).toBeInTheDocument();
  });

  it("save button becomes disabled when user types a new name after finding an available one", async () => {
    renderPage();
    fillBothFields("Best Pizza");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(screen.getByTestId("save-business-name")).toBeEnabled();

    fillText("New Name");
    expect(screen.getByTestId("save-business-name")).toBeDisabled();
  });
});
