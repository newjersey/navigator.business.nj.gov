import { FeedbackModal } from "@/components/betaBar/FeedbackModal";
import * as api from "@/lib/api-client/apiClient";
import { generateParsedUserAgent, generateProfileData, generateUserData } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postFeedback: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const getResult = jest.fn();
jest.mock("ua-parser-js", () => {
  return function () {
    return { getResult };
  };
});
const originalInnerWidth = global.innerWidth;

describe("<BetaBar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({ asPath: "roadmap/test" });
    mockApi.postFeedback.mockReturnValue(Promise.resolve());

    getResult.mockImplementation(() => generateParsedUserAgent({}));
  });

  afterEach(() => {
    global.innerWidth = originalInnerWidth;
  });

  const renderFeedbackModal = () => {
    render(<FeedbackModal isOpen={true} handleClose={() => {}} />);
  };

  describe("share feedback", () => {
    it("does not show feedback button when userData is undefined", () => {
      useUndefinedUserData();
      renderFeedbackModal();
      expect(screen.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
    });

    it("does not show feedback button when userData formProgress is not completed", () => {
      useMockUserData({ formProgress: "UNSTARTED" });
      renderFeedbackModal();
      expect(screen.queryByText(Config.betaBar.betaModalFeedbackButtonText)).not.toBeInTheDocument();
    });

    it("links to correct feedback form when completed onboarding and owns a business", () => {
      useMockUserData({
        formProgress: "COMPLETED",
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });
      renderFeedbackModal();

      expect(screen.getByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
      expect(screen.getByTestId("feedback-link").getAttribute("href")).toEqual(
        Config.betaBar.betaFormLinkOwning
      );
    });

    it("links to correct feedback form when completed onboarding and starting a business", () => {
      useMockUserData({
        formProgress: "COMPLETED",
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
      renderFeedbackModal();

      expect(screen.getByText(Config.betaBar.betaModalFeedbackButtonText)).toBeInTheDocument();
      expect(screen.getByTestId("feedback-link").getAttribute("href")).toEqual(
        Config.betaBar.betaFormLinkStarting
      );
    });
  });

  describe("request a feature", () => {
    it("does not show feature request button when userData is undefined", () => {
      useUndefinedUserData();
      renderFeedbackModal();
      expect(screen.queryByText(Config.betaBar.betaModalFeatureRequestButtonText)).not.toBeInTheDocument();
    });

    it("renders feature request modal and updates input element", () => {
      renderFeedbackModal();

      fireEvent.click(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });

      expect(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText)).toBeInTheDocument();
      expect((screen.getByLabelText("Feature request") as HTMLInputElement).value).toBe("random text");
    });

    it("renders successful submission modal after feature request is submitted", async () => {
      global.innerWidth = 500;

      const userAgent = {
        os: { name: "Mac OS", version: "10" },
        device: { vendor: "Google", model: "Pixel", type: "Mobile" },
        browser: { name: "Firefox", version: "6.5", major: "6" },
      };
      getResult.mockReturnValue(generateParsedUserAgent(userAgent));

      const userData = generateUserData({});
      useMockUserData(userData);

      const feedback = {
        browser: "Firefox v.6.5",
        device: "Mac OS 10 Google Pixel Mobile",
        screenWidth: "500 px",
        detail: "random text",
        pageOfRequest: "roadmap/test",
      };

      renderFeedbackModal();

      fireEvent.click(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.betaBar.featureRequestModalSubmitButtonText));

      await waitFor(() => {
        expect(screen.getByText(Config.betaBar.successfulSubmissionModalButtonText)).toBeInTheDocument();
      });

      expect(mockApi.postFeedback).toHaveBeenCalledTimes(1);
      expect(mockApi.postFeedback).toHaveBeenCalledWith(feedback, userData);
    });

    it("does not submit feature request when input is empty and shows inline validation error", () => {
      renderFeedbackModal();

      fireEvent.click(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText));
      fireEvent.click(screen.getByText(Config.betaBar.featureRequestModalSubmitButtonText));

      expect(screen.getByText(Config.betaBar.featureRequestModalInlineErrorText)).toBeInTheDocument();
      expect(mockApi.postFeedback).not.toHaveBeenCalled();
    });

    it("clicking the submit another feedback button displays the beta modal", async () => {
      renderFeedbackModal();

      fireEvent.click(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.betaBar.featureRequestModalSubmitButtonText));
      await waitFor(() => {
        screen.getByText(Config.betaBar.successfulSubmissionModalButtonText);
      });
      fireEvent.click(screen.getByText(Config.betaBar.successfulSubmissionModalButtonText));

      expect(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText)).toBeInTheDocument();
    });

    it("displays alert when feeback request is unsucessfully posted", async () => {
      mockApi.postFeedback.mockRejectedValue(500);

      renderFeedbackModal();

      fireEvent.click(screen.getByText(Config.betaBar.betaModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.betaBar.featureRequestModalSubmitButtonText));

      await waitFor(() => {
        expect(screen.getByTestId("dialog-alert")).toBeInTheDocument();
      });
    });
  });
});
