import { ProfileOpportunitiesAlert } from "@/components/profile/ProfileOpportunitiesAlert";
import { getMergedConfig } from "@/contexts/configContext";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  createEmptyProfileData,
  generateMunicipality,
  generateProfileData,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));

const Config = getMergedConfig();

describe("<ProfileOpportunitiesAlert />", () => {
  const renderComponent = (profileData?: ProfileData): void => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <ProfileOpportunitiesAlert />
      </WithStatefulProfileData>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    setupStatefulUserDataContext();
  });

  describe("when starting a business", () => {
    it("when all opportunity questions are  answered", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        dateOfFormation: "2023-03-01",
        municipality: generateMunicipality({}),
        homeBasedBusiness: true,
        ownershipTypeIds: ["none"],
        existingEmployees: "1",
        legalStructureId: "limited-partnership",
      });
      renderComponent(profileData);
      expect(screen.queryByTestId("opp-alert")).not.toBeInTheDocument();
    });

    it("when all opportunity questions are not answered", () => {
      const profileData = generateProfileData({
        businessPersona: "STARTING",
        dateOfFormation: undefined,
        municipality: undefined,
        homeBasedBusiness: undefined,
        ownershipTypeIds: [],
        existingEmployees: undefined,
        legalStructureId: "limited-partnership",
      });
      renderComponent(profileData);
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.dateOfFormation.default.header
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.ownershipTypeIds.default.header
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.existingEmployees.default.header
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("opp-alert")).getByText(
          Config.profileDefaults.fields.homeBasedBusiness.default.header
        )
      ).toBeInTheDocument();
    });
  });

  describe("when Foreign Nexus", () => {
    describe("when location in NJ", () => {
      it("when legal structure is a trade name", () => {
        const profileData = generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
          legalStructureId: "general-partnership",
          dateOfFormation: undefined,
          homeBasedBusiness: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
          municipality: undefined,
        });

        renderComponent(profileData);
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.municipality.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.dateOfFormation.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.ownershipTypeIds.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.existingEmployees.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.homeBasedBusiness.default.header
          )
        ).not.toBeInTheDocument();
      });

      it("when legal structure is not a trade name", () => {
        const profileData = generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
          legalStructureId: "limited-partnership",
          dateOfFormation: undefined,
          homeBasedBusiness: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
          municipality: undefined,
        });

        renderComponent(profileData);
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.dateOfFormation.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.municipality.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.ownershipTypeIds.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.existingEmployees.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.homeBasedBusiness.default.header
          )
        ).not.toBeInTheDocument();
      });
    });

    describe("when location not in NJ", () => {
      it("when legal structure is a trade name", () => {
        const profileData = generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          legalStructureId: "general-partnership",
          dateOfFormation: undefined,
          homeBasedBusiness: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
          municipality: undefined,
        });

        renderComponent(profileData);
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.homeBasedBusiness.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.dateOfFormation.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.ownershipTypeIds.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.existingEmployees.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.municipality.default.header
          )
        ).not.toBeInTheDocument();
      });

      it("when legal structure is not a trade name", () => {
        const profileData = generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          legalStructureId: "limited-partnership",
          dateOfFormation: undefined,
          homeBasedBusiness: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
          municipality: undefined,
        });

        renderComponent(profileData);
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.dateOfFormation.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).getByText(
            Config.profileDefaults.fields.homeBasedBusiness.default.header
          )
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.ownershipTypeIds.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.existingEmployees.default.header
          )
        ).not.toBeInTheDocument();
        expect(
          within(screen.getByTestId("opp-alert")).queryByText(
            Config.profileDefaults.fields.municipality.default.header
          )
        ).not.toBeInTheDocument();
      });
    });
  });
});
