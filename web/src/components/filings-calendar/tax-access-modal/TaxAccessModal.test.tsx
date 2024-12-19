import { TaxAccessModal } from "@/components/filings-calendar/tax-access-modal/TaxAccessModal";
import { getMergedConfig } from "@/contexts/configContext";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { generateOwningProfileData } from "@businessnjgovnavigator/shared/";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();
const userData = generateUserData({});

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<TaxAccessModal />", () => {
  const renderModal = (business?: Business): void => {
    render(
      <WithStatefulUserData
        initialUserData={business ? generateUserDataForBusiness(business) : generateUserData({})}
      >
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
        generateBusiness(userData, {
          profileData: generateProfileData({
            businessPersona: persona as BusinessPersona,
          }),
        })
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoBackButton)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoBody)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoCancelButton)).toBeInTheDocument();
      expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
    });
  });

  describe("when legal structure is undefined", () => {
    let undefinedLegalStructureBusiness: Business;

    beforeEach(() => {
      undefinedLegalStructureBusiness = generateBusiness(userData, {
        profileData: generateOwningProfileData({
          legalStructureId: undefined,
        }),
      });
    });

    it("shows step 1 question to choose a legal structure", () => {
      renderModal(undefinedLegalStructureBusiness);
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepOneBody)).toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoBody)).not.toBeInTheDocument();
    });

    it("does not save selection when closing modal", () => {
      renderModal(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");
      fireEvent.click(screen.getByLabelText("close"));
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("saves selection and moves to step 2 when clicking next button", async () => {
      renderModal(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");
      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(currentBusiness().profileData.legalStructureId).toBe("c-corporation");
      await waitFor(() => {
        expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
    });

    it("shows error when blur without selection", () => {
      renderModal(undefinedLegalStructureBusiness);
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
      renderModal(undefinedLegalStructureBusiness);
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
        generateBusiness(userData, {
          profileData: generateOwningProfileData({}),
        })
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepOneBody)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepTwoBody)).toBeInTheDocument();
      expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
    });

    it("moves back to step 1 on back button", () => {
      renderModal(
        generateBusiness(userData, {
          profileData: generateOwningProfileData({}),
        })
      );
      fireEvent.click(screen.getByText(Config.taxAccess.stepTwoBackButton));
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepOneBody)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoBody)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    });
  });
});
