import { TaskCtaLinks } from "@/components/TaskCtaLinks";
import analytics from "@/lib/utils/analytics";
import * as helpers from "@/lib/utils/helpers";
import { generatePostOnboarding, generateTask } from "@/test/factories";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      task_primary_call_to_action: {
        click: {
          open_external_website: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@/lib/utils/helpers", () => {
  return {
    ...jest.requireActual("@/lib/utils/helpers").default,
    openInNewTab: jest.fn(),
  };
});

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const mockHelpers = helpers as jest.Mocked<typeof helpers>;

describe("<TaskFooterCtas />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  describe("when task does not have post-onboarding question", () => {
    it("displays nothing when CTA link and text from task are not defined", () => {
      render(
        <TaskCtaLinks
          postOnboardingQuestion={undefined}
          task={generateTask({ callToActionLink: "", callToActionText: "" })}
        />
      );

      expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
    });

    it("displays CTA link from task", () => {
      render(
        <TaskCtaLinks
          postOnboardingQuestion={undefined}
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      expect(screen.getByTestId("cta-area")).toBeInTheDocument();
      expect(screen.getByText("CTA Link")).toBeInTheDocument();
    });

    it("fires CTA link analytics", () => {
      render(
        <TaskCtaLinks
          postOnboardingQuestion={undefined}
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      fireEvent.click(screen.getByText("CTA Link"));
      expect(
        mockAnalytics.event.task_primary_call_to_action.click.open_external_website
      ).toHaveBeenCalledWith("CTA Link", "https://www.example.com/0");
    });

    it("open new tab when CTA link is clicked", () => {
      render(
        <TaskCtaLinks
          postOnboardingQuestion={undefined}
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      expect(screen.getByTestId("cta-area")).toBeInTheDocument();
      fireEvent.click(screen.getByText("CTA Link"));
      expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
    });
  });

  describe("when task has post-onboarding question", () => {
    const questionWithNoCta = generatePostOnboarding({
      callToActionYesLink1: "",
      callToActionYesLink2: "",
      callToActionYesText1: "",
      callToActionYesText2: "",
    });

    const questionWithFirstCta = generatePostOnboarding({
      callToActionYesLink1: "https://www.example.com",
      callToActionYesText1: "Click Me",
      callToActionYesLink2: "",
      callToActionYesText2: "",
      callToActionYesDropdownText: "",
    });

    const questionWithSecondCta = generatePostOnboarding({
      callToActionYesLink2: "https://www.example.com",
      callToActionYesText2: "Click Me",
      callToActionYesLink1: "",
      callToActionYesText1: "",
      callToActionYesDropdownText: "",
    });

    const questionWithTwoCta = generatePostOnboarding({
      callToActionYesDropdownText: "Dropdown",
      callToActionYesLink1: "https://www.example.com/1",
      callToActionYesLink2: "https://www.example.com/2",
      callToActionYesText1: "Click Me",
      callToActionYesText2: "Click Me 2",
    });

    describe("when post-onboarding question does not have defined CTAs", () => {
      it("displays nothing when CTA link and text from task are not defined", () => {
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
          />
        );

        expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
      });

      it("displays CTA link from task", () => {
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("CTA Link")).toBeInTheDocument();
      });

      it("fires CTA link analytics", () => {
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("CTA Link"));
        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("CTA Link", "https://www.example.com/0");
      });

      it("open new tab when CTA link is clicked", () => {
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("CTA Link"));
        expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
      });
    });

    describe("when post-onboarding has CTAs and radio answer is no", () => {
      it("displays nothing when task CTA is not defined", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me 2")).not.toBeInTheDocument();
      });

      it("displays CTA link and does not display postOnboarding CTAs", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("CTA Link")).toBeInTheDocument();

        expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me 2")).not.toBeInTheDocument();
      });

      it("fires CTA link analytics", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("CTA Link"));
        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("CTA Link", "https://www.example.com/0");
      });

      it("open new tab when CTA link is clicked", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("CTA Link"));
        expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
      });
    });

    describe("when post-onboarding has CTAs and answer is yes", () => {
      it("displays one CTA button when only first is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithFirstCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
      });

      it("fires task CTA analytics when only first is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithFirstCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Click Me"));
        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("Click Me", "https://www.example.com");
      });

      it("open new tab when only first task CTA is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithFirstCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Click Me"));
        expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
      });

      it("displays one CTA button when only second is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithSecondCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
      });

      it("fires task CTA analytics when only second is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithSecondCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        fireEvent.click(screen.getByText("Click Me"));
        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("Click Me", "https://www.example.com");
      });

      it("open new tab when only second task CTA is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithSecondCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        fireEvent.click(screen.getByText("Click Me"));
        expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
      });

      it("displays dropdown CTA button when multiple are defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesDropdownText!));
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(screen.getByText("Click Me 2")).toBeInTheDocument();
      });

      it("fires task dropdown CTA button when multiple are defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesDropdownText!));
        fireEvent.click(screen.getByText("Click Me"));
        fireEvent.click(screen.getByText("Click Me 2"));

        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("Click Me", "https://www.example.com/1");
        expect(
          mockAnalytics.event.task_primary_call_to_action.click.open_external_website
        ).toHaveBeenCalledWith("Click Me 2", "https://www.example.com/2");
      });

      it("open new tab when only multiple task CTA is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });
        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesDropdownText!));

        fireEvent.click(screen.getByText("Click Me"));
        fireEvent.click(screen.getByText("Click Me 2"));
        expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(2);
      });

      it("prioritizes post-onboarding CTA over task CTA", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskCtaLinks
            postOnboardingQuestion={questionWithFirstCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "I am task CTA",
            })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(screen.queryByText("I am task CTA")).not.toBeInTheDocument();
      });
    });
  });
});
