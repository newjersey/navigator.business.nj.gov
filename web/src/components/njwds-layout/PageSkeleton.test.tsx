import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("<PageSkeleton />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("does not render the beta bar, legal message, and skip main content when landingPage prop is true", () => {
    render(
      <PageSkeleton landingPage={true}>
        <></>
      </PageSkeleton>
    );

    expect(screen.queryByTestId("beta-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("legal-message")).not.toBeInTheDocument();
    expect(screen.queryByTestId("skip-main-content")).not.toBeInTheDocument();
  });

  it("renders the beta bar, legal message, and skip main content when landingPage prop is false", () => {
    render(
      <PageSkeleton landingPage={false}>
        <></>
      </PageSkeleton>
    );

    expect(screen.getByTestId("beta-bar")).toBeInTheDocument();
    expect(screen.getByTestId("legal-message")).toBeInTheDocument();
    expect(screen.getByTestId("skip-main-content")).toBeInTheDocument();
  });
});
