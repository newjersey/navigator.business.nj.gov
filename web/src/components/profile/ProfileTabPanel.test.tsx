import { ProfileTabPanel } from "@/components/profile/ProfileTabPanel";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return { ...actual, useMediaQuery: jest.fn() };
});

jest.mock("@/lib/data-hooks/useUserData");

const mockUseMediaQuery = useMediaQuery as jest.Mock;
const mockUseUserData = useUserData as jest.Mock;

const config = getMergedConfig();

const setup = ({ showAlert = false }: { showAlert?: boolean } = {}): {
  profileAlertRef: React.RefObject<HTMLDivElement>;
} => {
  const profileAlertRef = React.createRef<HTMLDivElement>();

  mockUseMediaQuery.mockReturnValue(true);
  mockUseUserData.mockReturnValue({ business: { name: "MockBiz" } });

  render(
    <ProfileTabPanel showAlert={showAlert} profileAlertRef={profileAlertRef}>
      <div>Child content here</div>
    </ProfileTabPanel>,
  );

  return { profileAlertRef };
};

describe("ProfileTabPanel", () => {
  it("renders children", () => {
    setup();
    expect(screen.getByText("Child content here")).toBeInTheDocument();
  });

  it("renders alert when showAlert is true", () => {
    setup({ showAlert: true });
    expect(screen.getByTestId("profile-header-inline-alert")).toBeInTheDocument();
    expect(screen.getByText(config.profileDefaults.default.errorTextBody)).toBeInTheDocument();
  });

  it("does not render alert when showAlert is false", () => {
    setup({ showAlert: false });
    expect(screen.queryByTestId("profile-header-inline-alert")).not.toBeInTheDocument();
  });

  it("attaches profileAlertRef to the Alert", () => {
    const { profileAlertRef } = setup({ showAlert: true });
    const alertElement = screen.getByTestId("profile-header-inline-alert");
    expect(profileAlertRef.current).toBe(alertElement);
  });
});
