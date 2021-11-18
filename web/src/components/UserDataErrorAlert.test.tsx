import { useMockUserData, useMockUserDataError } from "@/test/mock/mockUseUserData";
import { render } from "@testing-library/react";
import React from "react";
import { UserDataErrorAlert } from "./UserDataErrorAlert";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<UserDataErrorAlert />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("does not display when no error", () => {
    useMockUserData({});
    const subject = render(<UserDataErrorAlert />);
    expect(subject.queryByTestId("error-alert-CACHED_ONLY")).not.toBeInTheDocument();
    expect(subject.queryByTestId("error-alert-NO_DATA")).not.toBeInTheDocument();
  });

  it("displays cached data alert when CACHED_ONLY error", () => {
    useMockUserDataError("CACHED_ONLY");
    const subject = render(<UserDataErrorAlert />);
    expect(subject.getByTestId("error-alert-CACHED_ONLY")).toBeInTheDocument();
  });

  it("displays no data alert when NO_DATA error", () => {
    useMockUserDataError("NO_DATA");
    const subject = render(<UserDataErrorAlert />);
    expect(subject.getByTestId("error-alert-NO_DATA")).toBeInTheDocument();
  });
});
