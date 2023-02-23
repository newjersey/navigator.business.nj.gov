import { FormationDateModal } from "@/components/FormationDateModal";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { generateProfileData, generateUserData } from "@/test/factories";
import { selectDate, selectLocationByText } from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentUserData,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  generateMunicipality,
  getCurrentDate,
  UserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();

describe("<FormationDateModal />", () => {
  const municipality = generateMunicipality({});

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const renderComponent = (initialUserData?: UserData) => {
    const userData = initialUserData ?? generateUserData({});

    const userDataWithMunicipality = {
      ...userData,
      profileData: {
        ...userData.profileData,
        municipality: userData.profileData.municipality === undefined ? undefined : municipality,
      },
    };

    render(
      <MunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
        <WithStatefulUserData initialUserData={userDataWithMunicipality}>
          <FormationDateModal isOpen={true} close={() => {}} onSave={() => {}} />
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
    expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
  });

  it("allows a date in the future", () => {
    renderComponent();
    const date = getCurrentDate().add(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
  });

  it("shows error when user saves without entering date", () => {
    renderComponent(generateUserData({ profileData: generateProfileData({ dateOfFormation: undefined }) }));
    expect(screen.queryByText(Config.formationDateModal.dateOfFormationErrorText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    expect(screen.getByText(Config.formationDateModal.dateOfFormationErrorText)).toBeInTheDocument();
  });

  it("does not update dateOfFormation if user cancels", () => {
    const initialUserData = generateUserData({});
    renderComponent(initialUserData);
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.cancelButtonText));
    triggerQueueUpdate();
    expect(currentUserData().profileData.dateOfFormation).toEqual(
      initialUserData.profileData.dateOfFormation
    );
  });

  it("shows and saves location field if user has not entered a location", () => {
    renderComponent(generateUserData({ profileData: generateProfileData({ municipality: undefined }) }));
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);

    selectLocationByText(municipality.displayName);

    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentUserData().profileData.municipality).toEqual(municipality);
  });

  it("does not show location field if user has already entered a location", () => {
    renderComponent();
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
  });

  it("shows location field if user is dakota nexus with a new jersey location", () => {
    renderComponent(
      generateUserData({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          nexusLocationInNewJersey: true,
          municipality: undefined,
        }),
      })
    );
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  it("does not show location field if user is dakota nexus with no new jersey location", () => {
    renderComponent(
      generateUserData({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          nexusLocationInNewJersey: false,
          municipality: undefined,
        }),
      })
    );
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
  });

  it("shows error when user saves without entering location", () => {
    renderComponent(generateUserData({ profileData: generateProfileData({ municipality: undefined }) }));
    expect(
      screen.queryByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    expect(
      screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
    ).toBeInTheDocument();
  });
});
