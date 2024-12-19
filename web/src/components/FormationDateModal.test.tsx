import { FormationDateModal } from "@/components/FormationDateModal";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { selectDate, selectLocationByText } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  defaultDateFormat,
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
  getCurrentDate,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();
const userData = generateUserData({});

describe("<FormationDateModal />", () => {
  const municipality = generateMunicipality({});

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const renderComponent = (initialBusiness?: Business): void => {
    const business = initialBusiness ?? generateBusiness(userData, {});

    const businessWithMunicipality = {
      ...business,
      profileData: {
        ...business.profileData,
        municipality: business.profileData.municipality === undefined ? undefined : municipality,
      },
    };

    render(
      <MunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(businessWithMunicipality)}>
          <FormationDateModal isOpen={true} close={(): void => {}} onSave={(): void => {}} />
        </WithStatefulUserData>
      </MunicipalitiesContext.Provider>
    );
  };

  it("updates date of formation in user data", () => {
    renderComponent();
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
  });

  it("allows a date in the future", () => {
    renderComponent();
    const date = getCurrentDate().add(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
  });

  it("shows error when user saves without entering date", () => {
    renderComponent(
      generateBusiness(userData, { profileData: generateProfileData({ dateOfFormation: undefined }) })
    );
    expect(screen.queryByText(Config.formationDateModal.dateOfFormationErrorText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    expect(screen.getByText(Config.formationDateModal.dateOfFormationErrorText)).toBeInTheDocument();
  });

  it("does not update dateOfFormation if user cancels", () => {
    const initialBusiness = generateBusiness(userData, {});
    renderComponent(initialBusiness);
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.cancelButtonText));
    triggerQueueUpdate();
    expect(currentBusiness().profileData.dateOfFormation).toEqual(
      initialBusiness.profileData.dateOfFormation
    );
  });

  it("shows and saves location field if user has not entered a location", () => {
    const startingOrForeign: Partial<ProfileData> =
      randomInt() % 2
        ? { businessPersona: "STARTING" }
        : { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] };

    renderComponent(
      generateBusiness(userData, {
        profileData: generateProfileData({
          municipality: undefined,
          ...startingOrForeign,
        }),
      })
    );
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);

    selectLocationByText(municipality.displayName);

    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentBusiness().profileData.municipality).toEqual(municipality);
  });

  it("does not show location field if user has already entered a location", () => {
    renderComponent();
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
  });

  it("shows location field if user is dakota nexus with a new jersey location", () => {
    renderComponent(
      generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
          municipality: undefined,
        }),
      })
    );
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  it("does not show location field if user is dakota nexus with no new jersey location", () => {
    renderComponent(
      generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          municipality: undefined,
        }),
      })
    );
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
  });

  it("shows error when user saves without entering location", () => {
    const startingOrForeign: Partial<ProfileData> =
      randomInt() % 2
        ? { businessPersona: "STARTING" }
        : { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] };

    renderComponent(
      generateBusiness(userData, {
        profileData: generateProfileData({ municipality: undefined, ...startingOrForeign }),
      })
    );
    expect(
      screen.queryByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    expect(
      screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
    ).toBeInTheDocument();
  });
});
