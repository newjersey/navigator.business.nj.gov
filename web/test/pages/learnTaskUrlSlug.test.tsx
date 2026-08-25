import analytics from "@/lib/utils/analytics";
import LearnTaskPage, { getStaticPaths, getStaticProps } from "@/pages/learn/[taskUrlSlug]";
import { getMergedConfig } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { ReactNode } from "react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => ({
  __esModule: true,
  default: {
    event: {
      learn_page: {
        click: {
          account_setup: jest.fn(),
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
jest.mock("@/components/LearnTaskSidebarPageLayout", () => ({
  LearnTaskSidebarPageLayout: ({
    belowBoxComponent,
    children,
  }: {
    belowBoxComponent: ReactNode;
    children: ReactNode;
  }): ReactNode => (
    <>
      {children}
      {belowBoxComponent}
    </>
  ),
}));

const Config = getMergedConfig();
const mockPush = jest.fn();

describe("learn task page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders CMS content and navigation for the selected step", () => {
    const learnStep = Config.learnPages.steps[1];

    render(<LearnTaskPage learnStep={learnStep} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `${Config.learnPages.stepText} 2`,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(learnStep.name);
    expect(screen.getByText(Config.learnPages.placeholderContent)).toBeInTheDocument();
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

  it("only renders next navigation for the first step", () => {
    render(<LearnTaskPage learnStep={Config.learnPages.steps[0]} />);

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

    render(<LearnTaskPage learnStep={finalStep} />);

    expect(
      screen.getByRole("link", { name: Config.learnPages.previousStepText }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: Config.learnPages.nextStepText }),
    ).not.toBeInTheDocument();
  });

  it("navigates to account setup from the account button", () => {
    render(<LearnTaskPage learnStep={Config.learnPages.steps[0]} />);

    fireEvent.click(screen.getByTestId("open-account-button"));

    expect(analytics.event.learn_page.click.account_setup).toHaveBeenCalledWith(
      Config.learnPages.steps[0].id,
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
