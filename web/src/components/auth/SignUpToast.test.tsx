import { SignUpToast } from "@/components/auth/SignUpToast";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}
jest.mock("@mui/material", () => mockMaterialUI());
const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

describe("SignUpToast", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });
  const setAlertIsVisible = jest.fn();
  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, alertIsVisible = true) => {
    render(withAuthAlert(<SignUpToast />, isAuthenticated, { alertIsVisible, setAlertIsVisible }));
  };

  it("shows registration alert when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestAlertTitle))).toBeInTheDocument();
  });

  it("is able to close registration alert when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByLabelText("close"));
    expect(setAlertIsVisible).toBeCalledWith(false);
  });

  it("does not show registration alert when alertIsVisible is false", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
    ).not.toBeInTheDocument();
  });

  it("does not show registration alert when user is authenticated", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
    ).not.toBeInTheDocument();
  });

  it("does not show registration alert when user is unknown", () => {
    setupHookWithAuth(IsAuthenticated.UNKNOWN, false);
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
    ).not.toBeInTheDocument();
  });

  it("icon logo on mobile", async () => {
    setLargeScreen(false);
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.queryByAltText("registration")).not.toBeInTheDocument();
  });

  it("icon logo on desktop", () => {
    setLargeScreen(true);
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByAltText("registration")).toBeInTheDocument();
  });
});
