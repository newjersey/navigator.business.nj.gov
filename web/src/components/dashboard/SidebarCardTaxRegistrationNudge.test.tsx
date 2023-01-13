import { SidebarCardRegisteredForTaxesNudge } from "@/components/dashboard/SidebarCardRegisteredForTaxesNudge";
import { getMergedConfig } from "@/contexts/configContext";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { SidebarCardContent } from "@/lib/types/types";
import {
  generatePreferences,
  generateProfileData,
  generateRoadmap,
  generateSidebarCardContent,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDateISOString } from "@businessnjgovnavigator/shared/dateHelpers";
import { taxTaskId } from "@businessnjgovnavigator/shared/index";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;

const Config = getMergedConfig();

describe("<SidebarCardTaxRegistrationNudge />", () => {
  let card: SidebarCardContent;

  const renderWithUserData = (userData: Partial<UserData>) => {
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

    it("opens the modal when the user clicks the registered for taxes nudge", () => {
      renderWithUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["registered-for-taxes-nudge"] }),
      });

      fireEvent.click(screen.getByTestId("cta-registered-for-taxes-nudge"));

      expect(screen.getByText(Config.registeredForTaxesModal.title)).toBeInTheDocument();
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
          filings: [generateTaxFiling({})],
          state: "SUCCESS",
        }),
      });
      renderWithUserData(initialUserData);

      fireEvent.click(screen.getByTestId("cta-registered-for-taxes-nudge"));

      expect(screen.getByText(Config.registeredForTaxesModal.title)).toBeInTheDocument();

      const businessNameInput = screen.getByLabelText("Business name");
      fireEvent.change(businessNameInput, { target: { value: "NJ Services" } });

      const taxIdInput = screen.getByLabelText("Tax id");
      fireEvent.change(taxIdInput, { target: { value: "123456789000" } });

      fireEvent.mouseDown(screen.getByLabelText("Ownership"));
      const listbox = within(screen.getByRole("listbox"));
      fireEvent.click(listbox.getByTestId("woman-owned"));

      const numberOfEmployeesInput = screen.getByLabelText("Existing employees");
      fireEvent.change(numberOfEmployeesInput, { target: { value: "3" } });

      fireEvent.click(screen.getByTestId("modal-button-primary"));

      const updatedUserData = {
        ...initialUserData,
        profileData: {
          ...initialUserData.profileData,
          businessName: "NJ Services",
          taxId: "123456789000",
          ownershipTypeIds: ["woman-owned"],
          existingEmployees: "3",
        },
        taskProgress: {
          ...initialUserData.taskProgress,
          [taxTaskId]: "COMPLETED",
        },
        taxFilingData: {
          ...initialUserData.taxFilingData,
          registeredISO: undefined,
          state: undefined,
          filings: [],
        },
      };

      await waitFor(() => {
        return expect(currentUserData()).toEqual(updatedUserData);
      });
      await waitFor(() => {
        return expect(screen.queryByText(Config.registeredForTaxesModal.title)).not.toBeInTheDocument();
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("closes the modal and does not update the user data when the user clicks the cancel button", async () => {
      const initialUserData = generateUserData({});
      renderWithUserData(initialUserData);

      fireEvent.click(screen.getByTestId("cta-registered-for-taxes-nudge"));

      expect(screen.getByText(Config.registeredForTaxesModal.title)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("modal-button-secondary"));

      await waitFor(() => {
        return expect(screen.queryByText(Config.registeredForTaxesModal.title)).not.toBeInTheDocument();
      });

      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });
});
