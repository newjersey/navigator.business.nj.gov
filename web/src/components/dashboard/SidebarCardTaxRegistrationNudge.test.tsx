import { SidebarCardRegisteredForTaxesNudge } from "@/components/dashboard/SidebarCardRegisteredForTaxesNudge";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { SidebarCardContent } from "@/lib/types/types";
import { generateRoadmap, generateSidebarCardContent } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDateISOString } from "@businessnjgovnavigator/shared/dateHelpers";
import { generateTaxFilingCalendarEvent, taxTaskId } from "@businessnjgovnavigator/shared/index";
import {
  generateProfileData,
  generateTaxFilingData,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;

describe("<SidebarCardTaxRegistrationNudge />", () => {
  let card: SidebarCardContent;

  const renderWithUserData = (userData: Partial<UserData>): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserData(userData)}>
        <SidebarCardRegisteredForTaxesNudge card={card} />
      </WithStatefulUserData>
    );
  };

  describe("when clicking registered for taxes button", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      setupStatefulUserDataContext();
      card = generateSidebarCardContent({ id: "registered-for-taxes-nudge" });
      mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    });

    it("saves tax information and updates the user data to COMPLETED registered for taxes task", async () => {
      const initialUserData = generateUserData({
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
      renderWithUserData(initialUserData);

      fireEvent.click(screen.getByTestId("cta-registered-for-taxes-nudge"));

      const updatedUserData = {
        ...initialUserData,
        taskProgress: {
          ...initialUserData.taskProgress,
          [taxTaskId]: "COMPLETED",
        },
      };

      await waitFor(() => {
        return expect(currentUserData()).toEqual(updatedUserData);
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
