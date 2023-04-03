import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import {
  fillText,
  getSearchValue,
  searchAndFail,
  searchAndGetValue,
  searchAndReject,
  searchButton,
} from "@/test/helpers/helpersSearchBusinessName";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ReactElement } from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();
const onChange = jest.fn();

describe("<SearchBusinessNameForm />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  const availableText = "AVAILABLE!";
  const unavailableText = "UNAVAILABLE!";
  const FakeAvailable = (): ReactElement => {
    return <div>{availableText}</div>;
  };
  const FakeUnavailable = (): ReactElement => {
    return <div>{unavailableText}</div>;
  };

  const renderForm = (): void => {
    render(
      <SearchBusinessNameForm
        available={FakeAvailable}
        unavailable={FakeUnavailable}
        onChange={onChange}
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
        }}
      />
    );
  };

  it("pre-fills the text field with the business name entered in onboarding", () => {
    useMockProfileData({ businessName: "Best Pizza" });
    renderForm();
    expect(getSearchValue()).toEqual("Best Pizza");
  });

  it("types a new potential name", () => {
    useMockProfileData({ businessName: "Best Pizza" });
    renderForm();
    fillText("My other new name");
    expect(getSearchValue()).toEqual("My other new name");
  });

  it("checks availability of typed name", async () => {
    renderForm();
    fillText("Pizza Joint");
    await searchAndGetValue({});
    expect(mockApi.searchBusinessName).toHaveBeenCalledWith("Pizza Joint");
  });

  it("shows available component if name is available", async () => {
    renderForm();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(availableTextExists()).toBe(true);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: "AVAILABLE",
      })
    );
  });

  it("updates onChange with undefined when new values are typed into the field", async () => {
    renderForm();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: "AVAILABLE",
      })
    );
    fillText("Pizza Place");
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("shows unavailable component if name is not available", async () => {
    renderForm();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(true);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows designator error text if name includes the designator", async () => {
    renderForm();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "DESIGNATOR_ERROR" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(true);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows special character error text if name includes a special character", async () => {
    renderForm();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "SPECIAL_CHARACTER_ERROR" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(true);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows restricted word error text if name includes a restricted word", async () => {
    renderForm();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "RESTRICTED_ERROR", invalidWord: "JOINT" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(true);
    expect(
      within(screen.getByTestId("restricted-word-error-text")).getByText("JOINT", { exact: false })
    ).toBeInTheDocument();
  });

  it("shows message if user searches empty name", async () => {
    renderForm();
    fillText("");
    fireEvent.click(searchButton());
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    renderForm();
    fillText("LLC");
    await searchAndReject();
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails", async () => {
    renderForm();
    fillText("whatever");
    await searchAndFail();
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  const availableTextExists = (): boolean => {
    return screen.queryByText(availableText) !== null;
  };
  const unavailableTextExists = (): boolean => {
    return screen.queryByText(unavailableText) !== null;
  };
  const designatorErrorTextExists = (): boolean => {
    return screen.queryByTestId("designator-error-text") !== null;
  };
  const specialCharacterErrorTextExists = (): boolean => {
    return screen.queryByTestId("special-character-error-text") !== null;
  };
  const restrictedWordErrorTextExists = (): boolean => {
    return screen.queryByTestId("restricted-word-error-text") !== null;
  };
});
