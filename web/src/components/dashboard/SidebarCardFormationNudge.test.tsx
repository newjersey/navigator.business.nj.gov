import { SidebarCardFormationNudge } from "@/components/dashboard/SidebarCardFormationNudge";
import { getMergedConfig } from "@/contexts/configContext";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { SidebarCardContent } from "@/lib/types/types";
import { generateRoadmap, generateSidebarCardContent } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { formationTaskId, generateProfileData } from "@businessnjgovnavigator/shared/";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { generatePreferences, generateUserData } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;

const Config = getMergedConfig();

describe("<SidebarCardFormationNudge />", () => {
  let card: SidebarCardContent;

  const renderWithBusiness = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserData(business)}>
        <SidebarCardFormationNudge card={card} />
      </WithStatefulUserData>
    );
  };

  describe("when clicking formation button", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      setupStatefulUserDataContext();
      card = generateSidebarCardContent({ id: SIDEBAR_CARDS.formationNudge });
      mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    });

    it("opens the modal when the user clicks the formation nudge", () => {
      renderWithBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [SIDEBAR_CARDS.formationNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-formation-nudge"));

      expect(screen.getByText(Config.formationDateModal.header)).toBeInTheDocument();
    });

    it("saves formation date and updates user data with completed formation task", async () => {
      const initialUserData = generateUserData({});
      renderWithBusiness(initialUserData);

      fireEvent.click(screen.getByTestId("cta-formation-nudge"));

      const input = screen.getByLabelText("Date of formation");
      fireEvent.change(input, { target: { value: "05/2021" } });
      fireEvent.blur(input);

      fireEvent.click(screen.getByTestId("modal-button-primary"));

      await waitFor(() => {
        expect(currentBusiness().profileData.dateOfFormation).toEqual("2021-05-01");
      });
      expect(currentBusiness().taskProgress[formationTaskId]).toEqual("COMPLETED");

      expect(screen.queryByTestId(Config.formationDateModal.header)).not.toBeInTheDocument();
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith({ query: { fromForming: "true" } }, undefined, {
          shallow: true,
        });
      });
    });

    it("closes the modal and does not update user data when the user clicks the cancel button", () => {
      const initialUserData = generateUserData({});
      renderWithBusiness(initialUserData);

      fireEvent.click(screen.getByTestId("cta-formation-nudge"));

      const input = screen.getByLabelText("Date of formation");
      fireEvent.change(input, { target: { value: "05/2021" } });
      fireEvent.blur(input);

      fireEvent.click(screen.getByTestId("modal-button-secondary"));

      expect(screen.queryByTestId(Config.formationDateModal.header)).not.toBeInTheDocument();

      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });
});
