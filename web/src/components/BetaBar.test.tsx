import { BetaBar } from "@/components/BetaBar";
import { generateProfileData } from "@/test/factories";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<BetaBar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  it("opens modal on button click", () => {
    const subject = render(<BetaBar />);
    expect(subject.queryByText(Config.betaBar.betaModalTitle)).not.toBeInTheDocument();
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalTitle)).toBeInTheDocument();
  });

  it("does not show feedback button when userData is undefined", () => {
    useUndefinedUserData();
    const subject = render(<BetaBar />);
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
  });

  it("does not show feedback button when userData formProgress is not completed", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    const subject = render(<BetaBar />);
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
  });

  it("links to correct feedback form when completed onboarding and owns a business", () => {
    useMockUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ hasExistingBusiness: true }),
    });
    const subject = render(<BetaBar />);
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
    expect(subject.getByTestId("feedback-link").getAttribute("href")).toEqual(
      Config.betaBar.betaFormLinkOwning
    );
  });

  it("links to correct feedback form when completed onboarding and starting a business", () => {
    useMockUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ hasExistingBusiness: false }),
    });
    const subject = render(<BetaBar />);
    fireEvent.click(subject.getByText(Config.betaBar.betaModalButtonText));
    expect(subject.queryByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
    expect(subject.getByTestId("feedback-link").getAttribute("href")).toEqual(
      Config.betaBar.betaFormLinkStarting
    );
  });
});
