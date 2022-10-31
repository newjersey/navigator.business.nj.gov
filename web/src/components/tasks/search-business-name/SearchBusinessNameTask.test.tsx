import { SearchBusinessNameTask } from "@/components/tasks/search-business-name/SearchBusinessNameTask";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import { fillText, searchAndGetValue } from "@/test/helpersSearchBusinessName";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    searchBusinessName: jest.fn(),
  };
});

describe("<SearchBusinessNameTask />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  const renderTask = () => {
    render(<SearchBusinessNameTask task={generateTask({})} />);
  };

  it("when available, updates the business name in roadmap", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({ businessName: "Best Pizza" }),
    });

    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={userData}>
        <SearchBusinessNameTask task={generateTask({})} />
      </WithStatefulUserData>
    );

    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });

    fireEvent.click(updateNameButton());
    expect(currentUserData().profileData.businessName).toEqual("Pizza Joint");
  });

  it("removes the update button when clicked and resets when new search is performed", async () => {
    renderTask();
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

  it("shows similar unavailable names when not available", async () => {
    renderTask();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(screen.getByText("Rusty's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pizzapizza")).toBeInTheDocument();
  });

  const updateNameButton = () => {
    return screen.getByTestId("update-name");
  };
  const updateNameButtonExists = () => {
    return screen.queryByTestId("update-name") !== null;
  };
  const nameHasBeenUpdatedTextExists = () => {
    return screen.queryByTestId("name-has-been-updated") !== null;
  };
});
