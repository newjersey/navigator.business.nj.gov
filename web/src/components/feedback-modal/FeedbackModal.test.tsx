import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import * as api from "@/lib/api-client/apiClient";
import { generateParsedUserAgent, generateProfileData, generateUserData } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    postFeedback: jest.fn(),
    postIssue: jest.fn(),
  };
});
const mockApi = api as jest.Mocked<typeof api>;

const getResult = jest.fn();
jest.mock("ua-parser-js", () => {
  return function () {
    return { getResult };
  };
});
const originalInnerWidth = global.innerWidth;

describe("<feedbackModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({ asPath: "roadmap/test" });
    mockApi.postFeedback.mockReturnValue(Promise.resolve());
    mockApi.postIssue.mockReturnValue(Promise.resolve());

    getResult.mockImplementation(() => {
      return generateParsedUserAgent({});
    });
  });

  afterEach(() => {
    global.innerWidth = originalInnerWidth;
  });

  const renderFeedbackModal = ({ isReportAnIssueBar = false }) => {
    render(<FeedbackModal isOpen={true} handleClose={() => {}} isReportAnIssueBar={isReportAnIssueBar} />);
  };

  describe("share feedback", () => {
    it("does not show feedback button when userData is undefined", () => {
      useUndefinedUserData();
      renderFeedbackModal({});
      expect(
        screen.queryByText(Config.feedbackModal.feedbackModalShareFeedbackButtonText)
      ).not.toBeInTheDocument();
    });

    it("does not show feedback button when userData formProgress is not completed", () => {
      useMockUserData({ formProgress: "UNSTARTED" });
      renderFeedbackModal({});
      expect(
        screen.queryByText(Config.feedbackModal.feedbackModalShareFeedbackButtonText)
      ).not.toBeInTheDocument();
    });

    describe("UP_AND_RUNNING phases", () => {
      const phases: OperatingPhaseId[] = ["UP_AND_RUNNING", "UP_AND_RUNNING_OWNING", "GUEST_MODE_OWNING"];
      for (const phase of phases) {
        it(`links to owning feedback form for ${phase}`, () => {
          useMockUserData({
            formProgress: "COMPLETED",
            profileData: generateProfileData({ operatingPhase: phase }),
          });
          renderFeedbackModal({});

          expect(
            screen.getByText(Config.feedbackModal.feedbackModalShareFeedbackButtonText)
          ).toBeInTheDocument();
          expect(screen.getByTestId("feedback-link")).toHaveAttribute(
            "href",
            Config.feedbackModal.feedbackModalLinkOwning
          );
        });
      }
    });

    describe("non - up-and-running phases", () => {
      const phases: OperatingPhaseId[] = [
        "GUEST_MODE",
        "NEEDS_TO_FORM",
        "NEEDS_TO_REGISTER_FOR_TAXES",
        "FORMED_AND_REGISTERED",
      ];
      for (const phase of phases) {
        it(`links to starting feedback form for ${phase}`, () => {
          useMockUserData({
            formProgress: "COMPLETED",
            profileData: generateProfileData({ operatingPhase: phase }),
          });
          renderFeedbackModal({});

          expect(
            screen.getByText(Config.feedbackModal.feedbackModalShareFeedbackButtonText)
          ).toBeInTheDocument();
          expect(screen.getByTestId("feedback-link")).toHaveAttribute(
            "href",
            Config.feedbackModal.feedbackModalLinkStarting
          );
        });
      }
    });
  });

  describe("request a feature", () => {
    it("does not show feature request button when userData is undefined", () => {
      useUndefinedUserData();
      renderFeedbackModal({});
      expect(
        screen.queryByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText)
      ).not.toBeInTheDocument();
    });

    it("renders feature request modal and updates input element", () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });

      expect(screen.getByText(Config.feedbackModal.featureRequestModalHeadingText)).toBeInTheDocument();
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

      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      await waitFor(() => {
        expect(
          screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText)
        ).toBeInTheDocument();
      });

      expect(mockApi.postFeedback).toHaveBeenCalledTimes(1);
      expect(mockApi.postFeedback).toHaveBeenCalledWith(feedback, userData);
    });

    it("does not submit feature request when input is empty and shows inline validation error", () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText));
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      expect(screen.getByText(Config.feedbackModal.feedbackInlineErrorText)).toBeInTheDocument();
      expect(mockApi.postFeedback).not.toHaveBeenCalled();
    });

    it("clicking the submit another feedback button displays the beta modal", async () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));
      await waitFor(() => {
        screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText);
      });
      fireEvent.click(screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText));

      expect(
        screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText)
      ).toBeInTheDocument();
    });

    it("displays alert when feeback request is unsucessfully submitted", async () => {
      mockApi.postFeedback.mockRejectedValue(500);

      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalFeatureRequestButtonText));
      fireEvent.change(screen.getByLabelText("Feature request"), { target: { value: "random text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      await waitFor(() => {
        expect(screen.getByTestId("modal-alert")).toBeInTheDocument();
      });
    });
  });

  describe("report an issue", () => {
    it("does not show report issue button when userData is undefined", () => {
      useUndefinedUserData();
      renderFeedbackModal({});
      expect(
        screen.queryByText(Config.feedbackModal.feedbackModalReportIssueButtonText)
      ).not.toBeInTheDocument();
    });

    it("renders report issue modal and updates input elements", async () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.change(screen.getByLabelText("Issue summary"), { target: { value: "random summary text" } });
      fireEvent.change(screen.getByLabelText("Issue details"), { target: { value: "random details text" } });

      expect(screen.getByText(Config.feedbackModal.reportIssueModalHeadingText)).toBeInTheDocument();
      expect((screen.getByLabelText("Issue summary") as HTMLInputElement).value).toBe("random summary text");
      expect((screen.getByLabelText("Issue details") as HTMLInputElement).value).toBe("random details text");
    });

    it("does not submit reported issue when issue summary input is empty and shows inline validation error", () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.change(screen.getByLabelText("Issue summary"), { target: { value: "random summary text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      expect(screen.getByText(Config.feedbackModal.feedbackInlineErrorText)).toBeInTheDocument();
      expect(mockApi.postIssue).not.toHaveBeenCalled();
    });

    it("does not submit reported issue when issue detail input is empty and shows inline validation error", () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.change(screen.getByLabelText("Issue details"), { target: { value: "random details text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      expect(screen.getByText(Config.feedbackModal.feedbackInlineErrorText)).toBeInTheDocument();
      expect(mockApi.postIssue).not.toHaveBeenCalled();
    });

    it("does not submit reported issue when issue detail inputs are empty and shows two inline validation errors", () => {
      renderFeedbackModal({});

      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      expect(screen.getAllByText(Config.feedbackModal.feedbackInlineErrorText)[0]).toBeInTheDocument();
      expect(screen.getAllByText(Config.feedbackModal.feedbackInlineErrorText)[1]).toBeInTheDocument();
    });

    it("opens issues modal when isBug prop is used and then returns to feedback selection modal after issue submission", async () => {
      renderFeedbackModal({ isReportAnIssueBar: true });

      fireEvent.change(screen.getByLabelText("Issue summary"), { target: { value: "random summary text" } });
      fireEvent.change(screen.getByLabelText("Issue details"), { target: { value: "random details text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));
      await waitFor(() => {
        screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText);
      });
      fireEvent.click(screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText));

      await waitFor(() => {
        expect(screen.getByText(Config.feedbackModal.feedbackModalTitle)).toBeInTheDocument();
      });
    });

    it("renders successful submission modal after reported issue is submitted", async () => {
      global.innerWidth = 500;

      const userAgent = {
        os: { name: "Mac OS", version: "10" },
        device: { vendor: "Google", model: "Pixel", type: "Mobile" },
        browser: { name: "Firefox", version: "6.5", major: "6" },
      };
      getResult.mockReturnValue(generateParsedUserAgent(userAgent));

      const userData = generateUserData({});
      useMockUserData(userData);

      const issue = {
        context: "random summary text",
        browser: "Firefox v.6.5",
        device: "Mac OS 10 Google Pixel Mobile",
        screenWidth: "500 px",
        detail: "random details text",
        pageOfRequest: "roadmap/test",
      };

      renderFeedbackModal({});
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.change(screen.getByLabelText("Issue summary"), { target: { value: "random summary text" } });
      fireEvent.change(screen.getByLabelText("Issue details"), { target: { value: "random details text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      await waitFor(() => {
        expect(
          screen.getByText(Config.feedbackModal.successfulSubmissionModalButtonText)
        ).toBeInTheDocument();
      });

      expect(mockApi.postIssue).toHaveBeenCalledTimes(1);
      expect(mockApi.postIssue).toHaveBeenCalledWith(issue, userData);
    });

    it("displays alert when reported issue is unsucessfully submitted", async () => {
      mockApi.postIssue.mockRejectedValue(500);

      renderFeedbackModal({});
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackModalReportIssueButtonText));
      fireEvent.change(screen.getByLabelText("Issue summary"), { target: { value: "random summary text" } });
      fireEvent.change(screen.getByLabelText("Issue details"), { target: { value: "random details text" } });
      fireEvent.click(screen.getByText(Config.feedbackModal.feedbackSubmitButtonText));

      await waitFor(() => {
        expect(screen.getByTestId("modal-alert")).toBeInTheDocument();
      });
    });
  });
});
