import analytics from "@/lib/utils/analytics";
import LearnTaskPage, { getStaticPaths, getStaticProps } from "@/pages/learn/[taskUrlSlug]";
import { renderWithUserData } from "@/test/render/renderWithUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";
import { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { ReactNode } from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/utils/analytics", () => ({
  __esModule: true,
  default: {
    event: {
      learn_page: {
        click: {
          account_setup: jest.fn(),
          side_nav_click: jest.fn(),
          step_nav_click: jest.fn(),
        },
      },
    },
  },
}));
jest.mock("next-seo", () => ({
  NextSeo: (): null => null,
}));
jest.mock("@/components/njwds/Icon", () => ({
  Icon: (): null => null,
}));
jest.mock("@/components/njwds-layout/PageSkeleton", () => ({
  PageSkeleton: ({ children }: { children: ReactNode }): ReactNode => children,
}));

const Config = getMergedConfig();
const mockPush = jest.fn();

describe("learn task page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useMediaQuery as jest.Mock).mockReturnValue(true);
  });

  it("renders CMS content and navigation for the selected step", () => {
    const learnStep = Config.learnPages.steps[1];

    renderWithUserData(<LearnTaskPage learnStep={learnStep} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `${Config.learnPages.stepText} 2`,
    );
    expect(screen.getByRole("heading", { level: 2, name: learnStep.name })).toBeInTheDocument();
    expect(
      screen.getByText(Config.learnPageFormBusiness.overview.split("\n\n")[0]),
    ).toBeInTheDocument();
    expect(screen.getByText(Config.learnPages.accountButtonHeading)).toBeInTheDocument();
    expect(screen.getByText(Config.learnPages.accountButtonText)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: Config.learnPages.previousStepText })).toHaveAttribute(
      "href",
      `/learn/${Config.learnPages.steps[0].id}`,
    );
    expect(screen.getByRole("link", { name: Config.learnPages.nextStepText })).toHaveAttribute(
      "href",
      `/learn/${Config.learnPages.steps[2].id}`,
    );
  });

  it("sends analytics events when clicking links in sidebar nav", () => {
    const learnStepThree = Config.learnPages.steps[2];

    renderWithUserData(<LearnTaskPage learnStep={learnStepThree} />);

    const sideNavLinkToStepOne = screen.getByRole("link", {
      name: `Step 1 ${Config.learnPages.steps[0].name}`,
    });
    expect(sideNavLinkToStepOne).toBeInTheDocument();

    sideNavLinkToStepOne.click();

    expect(analytics.event.learn_page.click.side_nav_click).toHaveBeenCalledWith(
      3,
      1,
      Config.learnPages.steps[0].name,
    );
  });

  it("sends an analytics event when clicking Previous Step link", () => {
    const learnStepThree = Config.learnPages.steps[2];

    renderWithUserData(<LearnTaskPage learnStep={learnStepThree} />);

    const stepNavLinkPrevious = screen.getByRole("link", {
      name: Config.learnPages.previousStepText,
    });
    expect(stepNavLinkPrevious).toBeInTheDocument();
    stepNavLinkPrevious.click();
    expect(analytics.event.learn_page.click.step_nav_click).toHaveBeenCalledWith("previous", 3, 2);
  });

  it("sends an analytics event when clicking Next Step link", () => {
    const learnStepThree = Config.learnPages.steps[2];

    renderWithUserData(<LearnTaskPage learnStep={learnStepThree} />);

    const stepNavLinkNext = screen.getByRole("link", {
      name: Config.learnPages.nextStepText,
    });
    expect(stepNavLinkNext).toBeInTheDocument();
    stepNavLinkNext.click();
    expect(analytics.event.learn_page.click.step_nav_click).toHaveBeenCalledWith("next", 3, 4);
  });

  it("renders the Find NAICS CMS content", () => {
    const learnStep = Config.learnPages.steps[2];

    renderWithUserData(<LearnTaskPage learnStep={learnStep} />);

    expect(
      screen.getByText(Config.learnPageFindNaics.content.split("\n\n")[0]),
    ).toBeInTheDocument();
    expect(screen.getByText("Register for NJ state taxes")).toBeInTheDocument();
  });

  it("renders the EIN overview and callout CMS content", () => {
    const learnStep = Config.learnPages.steps[3];

    renderWithUserData(<LearnTaskPage learnStep={learnStep} />);

    expect(screen.getByText(Config.learnPageGetEin.overview.split("\n\n")[0])).toBeInTheDocument();

    const calloutHeaders = [
      ...Config.learnPageGetEin.callouts.matchAll(/headerText="(?<headerText>[^"]*)"/g),
    ].map((match) => match.groups?.headerText);

    expect(calloutHeaders).toHaveLength(2);
    for (const headerText of calloutHeaders) {
      expect(screen.getByText(headerText ?? "")).toBeInTheDocument();
    }
  });

  it("renders the register for taxes overview and callout CMS content", () => {
    const learnStep = Config.learnPages.steps[4];

    renderWithUserData(<LearnTaskPage learnStep={learnStep} />);

    expect(
      screen.getByText(Config.learnPageRegisterTaxes.overview.split("\n\n")[0]),
    ).toBeInTheDocument();

    const calloutHeaders = [
      ...Config.learnPageRegisterTaxes.callouts.matchAll(/headerText="(?<headerText>[^"]*)"/g),
    ].map((match) => match.groups?.headerText);

    expect(calloutHeaders).toHaveLength(2);
    for (const headerText of calloutHeaders) {
      expect(screen.getByText(headerText ?? "")).toBeInTheDocument();
    }
  });

  it("renders the open account CMS content", () => {
    const learnStep = Config.learnPages.steps[5];

    renderWithUserData(<LearnTaskPage learnStep={learnStep} />);

    expect(
      screen.getByRole("heading", { level: 2, name: Config.learnPageOpenAccount.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.learnPageOpenAccount.content.split("\n\n")[0]),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: Config.learnPageOpenAccount.testimonialHeading,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`“${Config.learnPageOpenAccount.testimonialQuote}”`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`— ${Config.learnPageOpenAccount.testimonialAttribution}`),
    ).toBeInTheDocument();
  });

  it("only renders next navigation for the first step", () => {
    renderWithUserData(<LearnTaskPage learnStep={Config.learnPages.steps[0]} />);

    expect(
      screen.queryByRole("link", { name: Config.learnPages.previousStepText }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: Config.learnPages.nextStepText })).toBeInTheDocument();
  });

  it("only renders previous navigation for the final step", () => {
    const finalStep = Config.learnPages.steps.at(-1);

    expect(finalStep).toBeDefined();
    if (!finalStep) {
      return;
    }

    renderWithUserData(<LearnTaskPage learnStep={finalStep} />);

    expect(
      screen.getByRole("link", { name: Config.learnPages.previousStepText }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: Config.learnPages.nextStepText }),
    ).not.toBeInTheDocument();
  });

  it("navigates to account setup from the account button", () => {
    renderWithUserData(<LearnTaskPage learnStep={Config.learnPages.steps[0]} />);

    fireEvent.click(screen.getByTestId("open-account-button"));

    expect(analytics.event.learn_page.click.account_setup).toHaveBeenCalledWith(
      Config.learnPages.steps[0].name,
      Config.learnPages.accountButtonHeading,
    );
    expect(mockPush).toHaveBeenCalledWith("/account-setup/");
  });

  it("generates a static path for every CMS step", async () => {
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: Config.learnPages.steps.map((step) => ({
        params: { taskUrlSlug: step.id },
      })),
      fallback: false,
    });
  });

  it("returns the matching CMS step from static props", () => {
    const learnStep = Config.learnPages.steps[2];
    const context: GetStaticPropsContext = {
      params: { taskUrlSlug: learnStep.id },
    };

    expect(getStaticProps(context)).toEqual({
      props: { learnStep },
    });
  });

  it("returns not found for an unknown step", () => {
    const context: GetStaticPropsContext = {
      params: { taskUrlSlug: "unknown-step" },
    };

    expect(getStaticProps(context)).toEqual({ notFound: true });
  });
});
