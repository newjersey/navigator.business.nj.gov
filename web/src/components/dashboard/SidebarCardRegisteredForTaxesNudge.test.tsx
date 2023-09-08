import { SidebarCardRegisteredForTaxesNudge } from "@/components/dashboard/SidebarCardRegisteredForTaxesNudge";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { SidebarCardContent } from "@/lib/types/types";
import { generateRoadmap, generateSidebarCardContent } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDateISOString } from "@businessnjgovnavigator/shared/dateHelpers";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import {
  Business,
  generateTaxFilingCalendarEvent,
  generateUserDataForBusiness,
  taxTaskId,
} from "@businessnjgovnavigator/shared/index";
import {
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
} from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;

describe("<SidebarCardRegisteredForTaxesNudge />", () => {
  let card: SidebarCardContent;

  const renderWithBusiness = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness(business))}>
        <SidebarCardRegisteredForTaxesNudge card={card} />
      </WithStatefulUserData>
    );
  };

  describe("when clicking registered for taxes button", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      setupStatefulUserDataContext();
      card = generateSidebarCardContent({ id: SIDEBAR_CARDS.registeredForTaxes });
      mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    });

    it("saves tax information and updates the user data to COMPLETED registered for taxes task", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessName: "",
          taxId: "",
          legalStructureId: "limited-liability-partnership",
        }),
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          filings: [generateTaxFilingCalendarEvent({})],
          state: "SUCCESS",
        }),
      });
      renderWithBusiness(business);

      fireEvent.click(screen.getByTestId("cta-registered-for-taxes-nudge"));

      const updateBusiness = {
        ...business,
        taskProgress: {
          ...business.taskProgress,
          [taxTaskId]: "COMPLETED",
        },
      };

      await waitFor(() => {
        return expect(currentBusiness()).toEqual(updateBusiness);
      });
      expect(mockPush).toHaveBeenCalledWith({ query: { fromTaxRegistrationCard: "true" } }, undefined, {
        shallow: true,
      });
    });
  });
});
