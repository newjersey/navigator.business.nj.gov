import { CrtkNotFound } from "@/components/crtk/CrtkNotFound";
import { generateCrtkData } from "@/test/factories";
import {
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { CrtkData } from "@businessnjgovnavigator/shared/crtk";
import {
  generateBusiness,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ searchBuisnessInCrtkDB: jest.fn() }));

const mockOnSearchAgain = jest.fn();
const mockResubmit = jest.fn();

describe("CrtkNotFound", () => {
  const renderComponent = (overrides?: Partial<CrtkData>): void => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        crtkData: { ...generateCrtkData(overrides) },
      }),
      {
        user: generateUser({ email: "test@example.com", name: "Test Name" }),
      },
    );
    render(
      <WithStatefulUserData initialUserData={{ ...userData, ...overrides }}>
        <CrtkNotFound onSearchAgain={mockOnSearchAgain} reSubmit={mockResubmit} />
      </WithStatefulUserData>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupStatefulUserDataContext();
  });

  it("shows the email sent alert when crtKEmailSent is true", async () => {
    renderComponent({ crtkEmailSent: true });
    expect(screen.getByTestId("crtk-email-sent-alert")).toBeInTheDocument();
  });

  it("does not show the email sent alert when crtKEmailSent is false", async () => {
    renderComponent({ crtkEmailSent: false });
    expect(screen.queryByTestId("crtk-email-sent-alert")).not.toBeInTheDocument();
  });

  it("displays the business not found modal when crtkSearchResult is NOT_FOUND", async () => {
    mockResubmit.mockResolvedValue({});
    renderComponent({ crtkEmailSent: true, crtkSearchResult: "NOT_FOUND" });
    expect(screen.getByTestId("crtk-email-sent-alert")).toBeInTheDocument();
    expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("check your status"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });
  });

  it("doesn't display the business not found modal when crtkSearchResult is FOUND", async () => {
    mockResubmit.mockResolvedValue({});
    renderComponent({ crtkEmailSent: true, crtkSearchResult: "FOUND" });
    expect(screen.getByTestId("crtk-email-sent-alert")).toBeInTheDocument();
    expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("check your status"));
    await waitFor(() => {
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    });
  });
});
