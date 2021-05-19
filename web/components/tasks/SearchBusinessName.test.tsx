import { mockUpdate, useMockOnboardingData, useMockUserData } from "@/test/mock/mockUseUserData";
import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import * as api from "@/lib/api-client/apiClient";
import { generateNameAvailability, generateOnboardingData, generateUserData } from "@/test/factories";
import { NameAvailability } from "@/lib/types/types";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<SearchBusinessName />", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  it("pre-fills the text field with the business name entered in onboarding", () => {
    useMockOnboardingData({ businessName: "Best Pizza" });
    subject = render(<SearchBusinessName />);
    expect(getSearchValue()).toEqual("Best Pizza");
  });

  it("types a new potential name", () => {
    useMockOnboardingData({ businessName: "Best Pizza" });
    subject = render(<SearchBusinessName />);
    fillText("My other new name");
    expect(getSearchValue()).toEqual("My other new name");
  });

  it("checks availability of typed name", async () => {
    subject = render(<SearchBusinessName />);
    fillText("Pizza Joint");
    await searchAndGetValue({});
    expect(mockApi.searchBusinessName).toHaveBeenCalledWith("Pizza Joint");
  });

  it("shows available text if name is available", async () => {
    subject = render(<SearchBusinessName />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(subject.queryByTestId("available-text")).toBeInTheDocument();
    expect(subject.queryByTestId("unavailable-text")).not.toBeInTheDocument();
  });

  it("updates the business name in roadmap", async () => {
    const userData = generateUserData({
      onboardingData: generateOnboardingData({ businessName: "Best Pizza" }),
    });
    useMockUserData(userData);
    subject = render(<SearchBusinessName />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });

    fireEvent.click(subject.getByTestId("update-name"));
    expect(mockUpdate).toHaveBeenCalledWith({
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        businessName: "Pizza Joint",
      },
    });
  });

  it("shows unavailable text if name is not available", async () => {
    subject = render(<SearchBusinessName />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(subject.queryByTestId("available-text")).not.toBeInTheDocument();
    expect(subject.queryByTestId("unavailable-text")).toBeInTheDocument();
  });

  it("shows similar unavailable names when not available", async () => {
    subject = render(<SearchBusinessName />);
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(subject.queryByText("Rusty's Pizza")).toBeInTheDocument();
    expect(subject.queryByText("Pizzapizza")).toBeInTheDocument();
  });

  const getSearchValue = (): string =>
    (subject.queryByLabelText("Search business name") as HTMLInputElement)?.value;

  const fillText = (value: string) => {
    fireEvent.change(subject.getByLabelText("Search business name"), { target: { value: value } });
  };

  const searchAndGetValue = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(subject.getByTestId("search-availability"));
    await act(() => returnedPromise);
  };
});
