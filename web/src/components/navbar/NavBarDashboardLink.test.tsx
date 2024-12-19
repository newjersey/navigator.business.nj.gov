import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  WithStatefulUserData,
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import { Business, generateUserData } from "@businessnjgovnavigator/shared";
import {
  generateBusiness,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { UserData, createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      my_account: {
        click: {
          my_account: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const displayedLinkText = "random-text-to-display";

const renderComponent = ({
  userData,
  previousBusinessId,
}: {
  userData?: UserData | undefined;
  previousBusinessId?: string | undefined;
}): void => {
  render(
    <WithStatefulUserData
      initialUserData={userData === undefined ? createEmptyUserData(generateUser({})) : userData}
    >
      <NavBarDashboardLink linkText={displayedLinkText} previousBusinessId={previousBusinessId} />
    </WithStatefulUserData>
  );
};

describe("<NavBarDashboardLink/>", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  describe("when previousBusinessId prop is present", () => {
    let previousBusiness: Business;
    let newBusiness: Business;
    let userData: UserData;

    beforeEach(() => {
      previousBusiness = generateBusiness(generateUserData({}), {
        id: "previous-business-id",
        onboardingFormProgress: "COMPLETED",
      });
      newBusiness = generateBusiness(generateUserData({}), {
        id: "new-business-id",
        onboardingFormProgress: "UNSTARTED",
      });
      userData = generateUserDataForBusiness(newBusiness, {
        businesses: {
          "new-business-id": newBusiness,
          "previous-business-id": previousBusiness,
        },
      });
    });

    it("navigates to dashboard when link is clicked by the user", async () => {
      renderComponent({ userData, previousBusinessId: previousBusiness.id });
      fireEvent.click(screen.getByText(displayedLinkText));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
    });

    it("updates current business to previous business when link is clicked by the user", async () => {
      renderComponent({ userData, previousBusinessId: previousBusiness.id });
      fireEvent.click(screen.getByText(displayedLinkText));
      expect(currentUserData().currentBusinessId).toEqual("previous-business-id");
    });

    it("fires the dashboard analytics event when link is clicked by the user", async () => {
      renderComponent({ userData, previousBusinessId: previousBusiness.id });
      fireEvent.click(screen.getByText(displayedLinkText));
      await waitFor(() => {
        expect(mockAnalytics.event.my_account.click.my_account).toHaveBeenCalled();
      });
    });
  });

  describe("when previousBusinessId prop is not present", () => {
    it("navigates to the onboarding if onboarding hasn't been started", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness(generateUserData({}), { onboardingFormProgress: undefined })
      );
      renderComponent({ userData });
      fireEvent.click(screen.getByText(displayedLinkText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
    });

    it("navigates to the dashboard when link is clicked by the user", async () => {
      renderComponent({});
      fireEvent.click(screen.getByText(displayedLinkText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });

    it("doesn't update userData when link is clicked by the user", async () => {
      renderComponent({});
      fireEvent.click(screen.getByText(displayedLinkText));
      return expect(userDataWasNotUpdated()).toBe(true);
    });

    it("fires the dashboard analytics event when link is clicked by the user", async () => {
      renderComponent({});
      fireEvent.click(screen.getByText(displayedLinkText));
      expect(mockAnalytics.event.my_account.click.my_account).toHaveBeenCalled();
    });
  });
});
