import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import * as api from "@/lib/api-client/apiClient";
import { NameAvailability } from "@/lib/types/types";
import {
  generateNameAvailability,
  generateProfileData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { act, fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<SearchBusinessName />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  it("pre-fills the text field with the business name entered in onboarding", () => {
    useMockProfileData({ businessName: "Best Pizza" });
    render(<SearchBusinessName task={generateTask({})} />);
    expect(getSearchValue()).toEqual("Best Pizza");
  });

  it("types a new potential name", () => {
    useMockProfileData({ businessName: "Best Pizza" });
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("My other new name");
    expect(getSearchValue()).toEqual("My other new name");
  });

  it("checks availability of typed name", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({});
    expect(mockApi.searchBusinessName).toHaveBeenCalledWith("Pizza Joint");
  });

  it("shows available text if name is available", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(availableTextExists()).toBe(true);
    expect(unavailableTextExists()).toBe(false);
  });

  it("updates the business name in roadmap", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({ businessName: "Best Pizza" }),
    });

    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={userData}>
        <SearchBusinessName task={generateTask({})} />)
      </WithStatefulUserData>
    );

    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });

    fireEvent.click(updateNameButton());
    expect(currentUserData().profileData.businessName).toEqual("Pizza Joint");
  });

  it("removes the update button when clicked and resets when new search is performed", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    fireEvent.click(updateNameButton());

    expect(updateNameButtonExists()).toBe(false);
    expect(nameHasBeenUpdatedTextExists()).toBe(true);

    fillText("Pizza Joint 2");
    await searchAndGetValue({ status: "AVAILABLE" });

    expect(updateNameButtonExists()).toBe(true);
    expect(nameHasBeenUpdatedTextExists()).toBe(false);
  });

  it("shows unavailable text if name is not available", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(true);
  });

  it("shows similar unavailable names when not available", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(screen.getByText("Rusty's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows message if user searches empty name", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("");
    fireEvent.click(searchButton());
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("LLC");
    await searchAndReject();
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails", async () => {
    render(<SearchBusinessName task={generateTask({})} />);
    fillText("whatever");
    await searchAndFail();
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  const getSearchValue = (): string => (inputField() as HTMLInputElement)?.value;

  const fillText = (value: string) => {
    fireEvent.change(inputField(), { target: { value: value } });
  };

  const searchAndGetValue = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(searchButton());
    await act(() => returnedPromise.then());
  };

  const searchAndReject = async (): Promise<void> => {
    const returnedPromise = Promise.reject(400);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(searchButton());
    await act(() => returnedPromise.catch(() => {}));
  };

  const searchAndFail = async (): Promise<void> => {
    const returnedPromise = Promise.reject(500);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(searchButton());
    await act(() => returnedPromise.catch(() => {}));
  };

  const searchButton = () => screen.getByTestId("search-availability");
  const inputField = () => screen.getByLabelText("Search business name");
  const updateNameButton = () => screen.getByTestId("update-name");
  const availableTextExists = () => screen.queryByTestId("available-text") !== null;
  const unavailableTextExists = () => screen.queryByTestId("unavailable-text") !== null;
  const updateNameButtonExists = () => screen.queryByTestId("update-name") !== null;
  const nameHasBeenUpdatedTextExists = () => screen.queryByTestId("name-has-been-updated") !== null;
});
