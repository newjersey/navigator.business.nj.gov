import { QuickActionTile } from "@/components/dashboard/QuickActionTile";
import { ROUTES } from "@/lib/domain-logic/routes";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("<QuickActionTile />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("displays name", () => {
    render(<QuickActionTile name="some name" url="" />);
    expect(screen.getByText("some name")).toBeInTheDocument();
  });

  it("routes to actions/url when clicked", () => {
    render(<QuickActionTile name="some name" url="some-url" />);
    fireEvent.click(screen.getByText("some name"));
    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.quickActions}/some-url`);
  });
});
