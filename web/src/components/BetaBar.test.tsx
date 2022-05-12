import { BetaBar } from "@/components/BetaBar";
import { generateProfileData } from "@/test/factories";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<BetaBar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  it("opens modal on button click", () => {
    render(<BetaBar />);
    expect(screen.queryByText(Config.betaBar.betaModalTitle)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.getByText(Config.betaBar.betaModalTitle)).toBeInTheDocument();
  });

  it("does not show feedback button when userData is undefined", () => {
    useUndefinedUserData();
    render(<BetaBar />);
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
  });

  it("does not show feedback button when userData formProgress is not completed", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    render(<BetaBar />);
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
  });

  it("links to correct feedback form when completed onboarding and owns a business", () => {
    useMockUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ hasExistingBusiness: true }),
    });
    render(<BetaBar />);
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.getByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
    expect(screen.getByTestId("feedback-link").getAttribute("href")).toEqual(
      Config.betaBar.betaFormLinkOwning
    );
  });

  it("links to correct feedback form when completed onboarding and starting a business", () => {
    useMockUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ hasExistingBusiness: false }),
    });
    render(<BetaBar />);
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.getByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
    expect(screen.getByTestId("feedback-link").getAttribute("href")).toEqual(
      Config.betaBar.betaFormLinkStarting
    );
  });
});
