import { TaskFooterCtas } from "@/components/TaskFooterCtas";
import { generatePostOnboarding, generateTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("<TaskFooterCtas />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    useMockRouter({});
  });

  describe("when task does not have post-onboarding question", () => {
    it("displays nothing when CTA link and text from task are not defined", () => {
      render(
        <TaskFooterCtas
          postOnboardingQuestion={undefined}
          task={generateTask({ callToActionLink: "", callToActionText: "" })}
        />
      );

      expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
    });

    it("displays CTA link and text from task", () => {
      render(
        <TaskFooterCtas
          postOnboardingQuestion={undefined}
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      expect(screen.getByTestId("cta-area")).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com/0");
      expect(screen.getByText("CTA Link")).toBeInTheDocument();
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
          <TaskFooterCtas
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
          />
        );

        expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
      });

      it("displays CTA link and text from task when defined", () => {
        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithNoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com/0");
        expect(screen.getByText("CTA Link")).toBeInTheDocument();
      });
    });

    describe("when post-onboarding has CTAs and radio answer is no", () => {
      it("displays task CTA when exists", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({
              callToActionLink: "https://www.example.com/0",
              callToActionText: "CTA Link",
            })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com/0");
        expect(screen.getByText("CTA Link")).toBeInTheDocument();

        expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me 2")).not.toBeInTheDocument();
      });

      it("displays nothing when task CTA is not defined", () => {
        useMockProfileData({ constructionRenovationPlan: false });
        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
        expect(screen.queryByText("Click Me 2")).not.toBeInTheDocument();
      });
    });

    describe("when post-onboarding has CTAs and answer is yes", () => {
      it("displays one CTA button when only first is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithFirstCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com");
      });

      it("displays one CTA button when only second is defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithSecondCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com");
      });

      it("displays dropdown CTA button when multiple are defined", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskFooterCtas
            postOnboardingQuestion={questionWithTwoCta}
            task={generateTask({ callToActionLink: "", callToActionText: "" })}
            onboardingKey="constructionRenovationPlan"
          />
        );

        expect(screen.getByTestId("cta-area")).toBeInTheDocument();
        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesDropdownText!));

        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesText1!));
        expect(mockPush).toHaveBeenLastCalledWith(questionWithTwoCta.callToActionYesLink1);

        fireEvent.click(screen.getByText(questionWithTwoCta.callToActionYesText2!));
        expect(mockPush).toHaveBeenLastCalledWith(questionWithTwoCta.callToActionYesLink2);
      });

      it("prioritizes post-onboarding CTA over task CTA", () => {
        useMockProfileData({ constructionRenovationPlan: true });

        render(
          <TaskFooterCtas
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
        expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com");
      });
    });
  });
});
