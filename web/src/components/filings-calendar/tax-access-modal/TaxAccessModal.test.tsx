import { TaxAccessModal } from "@/components/filings-calendar/tax-access-modal/TaxAccessModal";
import { getMergedConfig } from "@/contexts/configContext";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateProfileData,
  generateUserData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<TaxAccessModal />", () => {
  const renderModal = (initialUserData?: UserData): void => {
    render(
      <WithStatefulUserData initialUserData={initialUserData || generateUserData({})}>
        <TaxAccessModal isOpen={true} close={(): void => {}} onSuccess={(): void => {}} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  describe("when poppy or dakota", () => {
    it.each(["STARTING", "FOREIGN"])("shows step 2 only with no step 1 for %s", (persona) => {
      renderModal(
        generateUserData({
          profileData: generateProfileData({
            businessPersona: persona as BusinessPersona,
            legalStructureId: randomLegalStructure().id,
          }),
        })
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoBackButton)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.body)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoCancelButton)).toBeInTheDocument();
      expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
    });
  });

  describe("when legal structure is undefined", () => {
    let undefinedLegalStructureUserData: UserData;

    beforeEach(() => {
      undefinedLegalStructureUserData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: undefined,
        }),
      });
    });

    it("shows step 1 question to choose a legal structure", () => {
      renderModal(undefinedLegalStructureUserData);
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.body)).toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
    });

    it("does not save selection when closing modal", () => {
      renderModal(undefinedLegalStructureUserData);
      selectDropdownByValue("Business structure", "c-corporation");
      fireEvent.click(screen.getByLabelText("close"));
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("saves selection and moves to step 2 when clicking next button", async () => {
      renderModal(undefinedLegalStructureUserData);
      selectDropdownByValue("Business structure", "c-corporation");
      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(currentUserData().profileData.legalStructureId).toBe("c-corporation");
      await waitFor(() => {
        expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
    });

    it("shows error when blur without selection", () => {
      renderModal(undefinedLegalStructureUserData);
      expect(screen.queryByText(Config.taxAccess.stepOneErrorBanner)).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
      ).not.toBeInTheDocument();

      fireEvent.blur(screen.getByLabelText("Business structure"));
      expect(screen.getByText(Config.taxAccess.stepOneErrorBanner)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("does not allow clicking next when no selection", () => {
      renderModal(undefinedLegalStructureUserData);
      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(screen.getByText(Config.taxAccess.stepOneErrorBanner)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });
  });

  describe("when legal structure is defined", () => {
    it("shows step 2 question", () => {
      renderModal(
        generateUserData({
          profileData: generateProfileData({
            businessPersona: "OWNING",
            legalStructureId: randomLegalStructure().id,
          }),
        })
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.body)).toBeInTheDocument();
      expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
    });

    it("moves back to step 1 on back button", () => {
      renderModal(
        generateUserData({
          profileData: generateProfileData({
            businessPersona: "OWNING",
            legalStructureId: randomLegalStructure().id,
          }),
        })
      );
      fireEvent.click(screen.getByText(Config.taxAccess.stepTwoBackButton));
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    });
  });
});
