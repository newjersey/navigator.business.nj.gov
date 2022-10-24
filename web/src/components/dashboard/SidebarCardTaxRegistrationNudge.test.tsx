import { getMergedConfig } from "@/contexts/configContext";
import { SidebarCardContent } from "@/lib/types/types";
import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
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
import { taxTaskId } from "@businessnjgovnavigator/shared/index";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { generateTaxFiling } from "../../../test/factories";
import { SidebarCardTaxRegistrationNudge } from "./SidebarCardTaxRegistrationNudge";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<SidebarCardTaxRegistrationNudge />", () => {
  let card: SidebarCardContent;

  const renderWithUserData = (userData: Partial<UserData>) => {
    render(
      <WithStatefulUserData initialUserData={generateUserData(userData)}>
        <SidebarCardTaxRegistrationNudge card={card} />
      </WithStatefulUserData>
    );
  };

  describe("when clicking tax registration button", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
      setupStatefulUserDataContext();
      card = generateSidebarCardContent({ id: "tax-registration-nudge" });
    });

    it("opens the modal when the user clicks the tax registration nudge", () => {
      renderWithUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["tax-registration-nudge"] }),
      });

      fireEvent.click(screen.getByTestId("cta-tax-registration-nudge"));

      expect(screen.getByText(Config.taxRegistrationModal.title)).toBeInTheDocument();
    });

    it("saves tax information and updates the user data to COMPLETED tax registration task", async () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          businessName: "",
          taxId: "",
          legalStructureId: "limited-liability-partnership",
        }),
        taxFilingData: generateTaxFilingData({
          registered: true,
          filings: [generateTaxFiling({})],
          state: "SUCCESS",
        }),
      });
      renderWithUserData(initialUserData);

      fireEvent.click(screen.getByTestId("cta-tax-registration-nudge"));

      expect(screen.getByText(Config.taxRegistrationModal.title)).toBeInTheDocument();

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
          registered: false,
          state: undefined,
          filings: [],
        },
      };

      await waitFor(() => expect(currentUserData()).toEqual(updatedUserData));
      await waitFor(() =>
        expect(screen.queryByText(Config.taxRegistrationModal.title)).not.toBeInTheDocument()
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("closes the modal and does not update the user data when the user clicks the cancel button", async () => {
      const initialUserData = generateUserData({});
      renderWithUserData(initialUserData);

      fireEvent.click(screen.getByTestId("cta-tax-registration-nudge"));

      expect(screen.getByText(Config.taxRegistrationModal.title)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("modal-button-secondary"));

      await waitFor(() =>
        expect(screen.queryByText(Config.taxRegistrationModal.title)).not.toBeInTheDocument()
      );

      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });
});
