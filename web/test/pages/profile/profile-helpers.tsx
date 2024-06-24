import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ProfileTabs } from "@/lib/types/types";
import Profile from "@/pages/profile";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { WithStatefulProfileFormContext } from "@/test/mock/withStatefulProfileData";
import {
  currentBusiness,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  BusinessPersona,
  einTaskId,
  generateBusiness,
  generateMunicipality,
  generateProfileData,
  generateUserDataForBusiness,
  OperatingPhases,
  ProfileData,
  TaskProgress,
} from "@businessnjgovnavigator/shared";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();

export const generateBusinessForProfile = (overrides: Partial<Business>): Business => {
  const profileData = generateProfileData({ ...overrides.profileData });
  const taskProgress: Record<string, TaskProgress> =
    profileData.employerId && profileData.employerId.length > 0
      ? { [einTaskId]: "COMPLETED", ...overrides.taskProgress }
      : { ...overrides.taskProgress };
  return generateBusiness({ ...overrides, profileData, taskProgress });
};

export const renderPage = ({
  municipalities,
  business,
  isAuthenticated,
  setShowNeedsAccountModal,
}: {
  municipalities?: Municipality[];
  business?: Business;
  isAuthenticated?: IsAuthenticated;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setShowNeedsAccountModal?: jest.Mock<any, any, any>;
}): void => {
  const genericTown = generateMunicipality({ displayName: "GenericTown" });
  const profileDataMunicipality = business && business.profileData.municipality;
  const formationNJAddress = business && business.formationData.formationFormData.addressMunicipality;

  const municipalitiesList = [genericTown];
  if (profileDataMunicipality) municipalitiesList.push(profileDataMunicipality);
  if (formationNJAddress) municipalitiesList.push(formationNJAddress);
  if (municipalities) municipalitiesList.push(...municipalities);

  const initialBusiness =
    business ??
    generateBusiness({
      profileData: generateProfileData({
        municipality: genericTown,
      }),
    });

  render(
    withNeedsAccountContext(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulProfileFormContext>
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
            <Profile municipalities={municipalitiesList} />
          </WithStatefulUserData>
        </WithStatefulProfileFormContext>
      </ThemeProvider>,
      isAuthenticated ?? IsAuthenticated.TRUE,
      { showNeedsAccountModal: false, setShowNeedsAccountModal: setShowNeedsAccountModal ?? jest.fn() }
    )
  );
};

export const fillText = (label: string, value: string): void => {
  fireEvent.change(screen.getByLabelText(label), { target: { value: value } });
  fireEvent.blur(screen.getByLabelText(label));
};

export const selectByValue = (label: string, value: string): void => {
  expect(screen.getByLabelText(label)).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByTestId(value));
};

export const selectByText = (label: string, value: string): void => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByText(value));
};

export const clickBack = (): void => {
  fireEvent.click(screen.getAllByTestId("back")[0]);
};

export const clickSave = (): void => {
  fireEvent.click(screen.getAllByTestId("save")[0]);
};

export const chooseRadio = (value: string): void => {
  fireEvent.click(screen.getByTestId(value));
};

export const chooseTab = (value: ProfileTabs): void => {
  fireEvent.click(screen.getByTestId(value));
};

export const getBusinessNameValue = (): string => {
  return (screen.queryByLabelText("Business name") as HTMLInputElement)?.value;
};

export const getEntityIdValue = (): string => {
  return (screen.queryByLabelText("Entity id") as HTMLInputElement)?.value;
};

export const getDateOfFormation = (): string => {
  return (screen.queryByLabelText("Date of formation") as HTMLInputElement)?.value;
};

export const getNotesValue = (): string => {
  return (screen.queryByLabelText("Notes") as HTMLInputElement)?.value;
};

export const getTaxIdValue = (): string => {
  return (screen.queryByLabelText("Tax id") as HTMLInputElement)?.value;
};

export const getEmployerIdValue = (): string => {
  return (screen.queryByLabelText("Employer id") as HTMLInputElement)?.value;
};

export const getMunicipalityValue = (): string => {
  return (screen.queryByTestId("municipality") as HTMLInputElement)?.value;
};

export const getBusinessProfileInputFieldName = (business: Business): string => {
  return LookupLegalStructureById(business.profileData.legalStructureId).hasTradeName
    ? "Trade name"
    : "Business name";
};

export const removeLocationAndSave = (): void => {
  fillText("Location", "");
  fireEvent.blur(screen.getByLabelText("Location"));
  clickSave();
};

export const expectLocationSavedAsUndefined = async (): Promise<void> => {
  await waitFor(() => {
    return expect(currentBusiness().profileData.municipality).toEqual(undefined);
  });
};

export const expectLocationNotSavedAndError = (): void => {
  expect(userDataWasNotUpdated()).toBe(true);
  expect(
    screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
  ).toBeInTheDocument();
  expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
};

export const getForeignNexusProfileFields = (businessPersona: BusinessPersona): Partial<ProfileData> => {
  return businessPersona === "FOREIGN"
    ? {
        foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
      }
    : {};
};
export const phasesWhereGoToProfileShows = OperatingPhases.filter(
  (it) => it.displayProfileOpportunityAlert
).map((it) => it.id);

export const phasesWhereGoToProfileDoesNotShow = OperatingPhases.filter(
  (it) => !it.displayProfileOpportunityAlert
).map((it) => it.id);
