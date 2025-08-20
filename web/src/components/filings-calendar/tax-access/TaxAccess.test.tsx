import { TaxAccess } from "@/components/filings-calendar/tax-access/TaxAccess";
import analytics from "@/lib/utils/analytics";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { generateOwningProfileData } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      tax_calendar: {
        arrive: {
          arrive_calendar_access_v2: jest.fn(),
        },
        click: {
          click_calendar_access_v2: jest.fn(),
        },
        submit: {
          tax_calendar_validation_error: jest.fn(),
        },
      },
    },
  };
}

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<TaxAccess />", () => {
  const renderComponent = (business?: Business): void => {
    render(
      <WithStatefulUserData
        initialUserData={business ? generateUserDataForBusiness(business) : generateUserData({})}
      >
        <TaxAccess onSuccess={(): void => {}} />
      </WithStatefulUserData>,
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  describe("when poppy or dakota", () => {
    it.each(["STARTING", "FOREIGN"])("shows step 2 only with no step 1 for %s", (persona) => {
      renderComponent(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: persona as BusinessPersona,
          }),
        }),
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoBackButton)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.taxCalendarAccessBody)).toBeInTheDocument();
      expect(screen.getByLabelText("Tax id")).toBeInTheDocument();
    });
  });

  describe("when legal structure is undefined", () => {
    let undefinedLegalStructureBusiness: Business;

    beforeEach(() => {
      undefinedLegalStructureBusiness = generateBusiness({
        profileData: generateOwningProfileData({
          legalStructureId: undefined,
        }),
      });
    });

    it("shows step 1 question to choose a legal structure", () => {
      renderComponent(undefinedLegalStructureBusiness);
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.taxCalendarAccessBody)).toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
    });

    it("does not save selection when refreshing page", () => {
      renderComponent(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");
      // Simulate page refresh
      renderComponent(undefinedLegalStructureBusiness);
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("saves selection and moves to step 2 when clicking next button", async () => {
      renderComponent(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");
      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(currentBusiness().profileData.legalStructureId).toBe("c-corporation");
      await waitFor(() => {
        expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
    });

    it("shows error when blur without selection", () => {
      renderComponent(undefinedLegalStructureBusiness);
      expect(screen.queryByText(Config.taxAccess.stepOneErrorBanner)).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          Config.profileDefaults.fields.legalStructureId.default.errorTextRequired,
        ),
      ).not.toBeInTheDocument();

      fireEvent.blur(screen.getByLabelText("Business structure"));
      expect(screen.getByText(Config.taxAccess.stepOneErrorBanner)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired),
      ).toBeInTheDocument();
    });

    it("does not allow clicking next when no selection", () => {
      renderComponent(undefinedLegalStructureBusiness);
      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(screen.getByText(Config.taxAccess.stepOneErrorBanner)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired),
      ).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });
  });

  describe("when legal structure is already defined", () => {
    it("shows step 2 question without steps header", () => {
      renderComponent(
        generateBusiness({
          profileData: generateOwningProfileData({}),
        }),
      );
      expect(screen.queryByText(Config.taxAccess.stepOneHeader)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.taxCalendarAccessBody)).toBeInTheDocument();
      expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
    });

    it("does not display a back button", () => {
      renderComponent(
        generateBusiness({
          profileData: generateOwningProfileData({}),
        }),
      );

      expect(screen.queryByText(Config.taxAccess.stepTwoBackButton)).not.toBeInTheDocument();
    });
  });

  describe("two-step flow where legal structure was undefined then defined in step 1", () => {
    let undefinedLegalStructureBusiness: Business;

    beforeEach(() => {
      undefinedLegalStructureBusiness = generateBusiness({
        profileData: generateOwningProfileData({
          legalStructureId: undefined,
        }),
      });
    });

    it("shows step 2 question with steps header", async () => {
      renderComponent(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");

      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      expect(currentBusiness().profileData.legalStructureId).toBe("c-corporation");

      await waitFor(() => {
        expect(screen.getByText(Config.taxAccess.stepTwoHeader)).toBeInTheDocument();
      });

      expect(screen.getByText(Config.taxAccess.taxCalendarAccessBody)).toBeInTheDocument();
      expect(
        screen.queryByLabelText(Config.taxAccess.legalStructureDropDownHeader),
      ).not.toBeInTheDocument();
    });

    it("moves back to step 1 on back button", async () => {
      renderComponent(undefinedLegalStructureBusiness);
      selectDropdownByValue("Business structure", "c-corporation");

      fireEvent.click(screen.getByText(Config.taxAccess.stepOneNextButton));
      await waitFor(() => {
        expect(currentBusiness().profileData.legalStructureId).toBe("c-corporation");
      });

      fireEvent.click(screen.getByText(Config.taxAccess.stepTwoBackButton));
      await waitFor(() => {
        expect(screen.getByText(Config.taxAccess.stepOneHeader)).toBeInTheDocument();
      });

      expect(screen.getByText(Config.taxAccess.taxCalendarAccessBody)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.stepTwoHeader)).not.toBeInTheDocument();
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    });
  });

  describe("tax calendar access analytics", () => {
    let undefinedLegalStructureBusiness: Business;

    beforeEach(() => {
      undefinedLegalStructureBusiness = generateBusiness({
        profileData: generateOwningProfileData({
          legalStructureId: undefined,
        }),
      });
    });

    it("tracks tax calendar access analytics", () => {
      renderComponent(undefinedLegalStructureBusiness);
      expect(mockAnalytics.event.tax_calendar.arrive.arrive_calendar_access_v2).toHaveBeenCalled();
    });
  });
});
