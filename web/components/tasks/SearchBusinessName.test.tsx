import { mockUpdate, useMockOnboardingData, useMockUserData } from "@/test/mock/mockUseUserData";
import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import * as api from "@/lib/api-client/apiClient";
import {
  generateNameAvailability,
  generateOnboardingData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { NameAvailability } from "@/lib/types/types";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<SearchBusinessName />", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  it("pre-fills the text field with the business name entered in onboarding", () => {
    useMockOnboardingData({ businessName: "Best Pizza" });
    subject = render(<SearchBusinessName task={generateTask({})} />);
    expect(getSearchValue()).toEqual("Best Pizza");
  });

  it("types a new potential name", () => {
    useMockOnboardingData({ businessName: "Best Pizza" });
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("My other new name");
    expect(getSearchValue()).toEqual("My other new name");
  });

  it("checks availability of typed name", async () => {
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({});
    expect(mockApi.searchBusinessName).toHaveBeenCalledWith("Pizza Joint");
  });

  it("shows available text if name is available", async () => {
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(availableTextExists()).toBe(true);
    expect(unavailableTextExists()).toBe(false);
  });

  it("updates the business name in roadmap", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({ businessName: "Best Pizza" }),
    });
    useMockUserData(userData);
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });

    fireEvent.click(updateNameButton());
    expect(mockUpdate).toHaveBeenCalledWith({
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        businessName: "Pizza Joint",
      },
    });
  });

  it("removes the update button when clicked and resets when new search is performed", async () => {
    useMockUserData(generateUserData({}));
    subject = render(<SearchBusinessName task={generateTask({})} />);
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
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(true);
  });

  it("shows similar unavailable names when not available", async () => {
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(subject.queryByText("Rusty's Pizza")).toBeInTheDocument();
    expect(subject.queryByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows message if user searches empty name", async () => {
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("");
    fireEvent.click(searchButton());
    expect(subject.queryByTestId("bad-input-alert")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(subject.queryByTestId("bad-input-alert")).not.toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    subject = render(<SearchBusinessName task={generateTask({})} />);
    fillText("LLC");
    await searchAndReject();
    expect(subject.queryByTestId("bad-input-alert")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(subject.queryByTestId("bad-input-alert")).not.toBeInTheDocument();
  });

  const getSearchValue = (): string => (inputField() as HTMLInputElement)?.value;

  const fillText = (value: string) => {
    fireEvent.change(inputField(), { target: { value: value } });
  };

  const searchAndGetValue = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(searchButton());
    await act(() => returnedPromise);
  };

  const searchAndReject = async (): Promise<void> => {
    const returnedPromise = Promise.reject(400);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(searchButton());
    await act(() => returnedPromise.catch(() => {}));
  };

  const searchButton = () => subject.getByTestId("search-availability");
  const inputField = () => subject.getByLabelText("Search business name");
  const updateNameButton = () => subject.getByTestId("update-name");
  const availableTextExists = () => subject.queryByTestId("available-text") !== null;
  const unavailableTextExists = () => subject.queryByTestId("unavailable-text") !== null;
  const updateNameButtonExists = () => subject.queryByTestId("update-name") !== null;
  const nameHasBeenUpdatedTextExists = () => subject.queryByTestId("name-has-been-updated") !== null;
});
