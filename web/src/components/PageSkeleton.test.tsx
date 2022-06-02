import { PageSkeleton } from "@/components/PageSkeleton";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<RightSidebarPageLayout />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("does not render report an issues bar if onboarding is not completed", () => {
    useMockUserData({ formProgress: "UNSTARTED" });

    render(
      <PageSkeleton>
        <></>
      </PageSkeleton>
    );

    expect(screen.queryByTestId("bugBar")).not.toBeInTheDocument();
  });

  it("renders report an issues bar after onboarding is completed", () => {
    useMockUserData({ formProgress: "COMPLETED" });

    render(
      <PageSkeleton>
        <></>
      </PageSkeleton>
    );

    expect(screen.getByTestId("bugBar")).toBeInTheDocument();
  });
});
