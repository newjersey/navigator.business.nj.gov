import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { useMockBusiness, useMockUserDataError } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("<UserDataErrorAlert />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("does not display when no error", () => {
    useMockBusiness({});
    render(<UserDataErrorAlert />);
    expect(screen.queryByTestId("error-alert-CACHED_ONLY")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-alert-NO_DATA")).not.toBeInTheDocument();
  });

  it("displays cached data alert when CACHED_ONLY error", () => {
    useMockUserDataError("CACHED_ONLY");
    render(<UserDataErrorAlert />);
    expect(screen.getByTestId("error-alert-CACHED_ONLY")).toBeInTheDocument();
  });

  it("displays no data alert when NO_DATA error", () => {
    useMockUserDataError("NO_DATA");
    render(<UserDataErrorAlert />);
    expect(screen.getByTestId("error-alert-NO_DATA")).toBeInTheDocument();
  });
});
