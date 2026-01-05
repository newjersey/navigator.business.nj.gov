import { IsAuthenticated } from "@/lib/auth/AuthContext";
import Profile from "@/pages/profile";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { WithStatefulDataFieldFormContext } from "@/test/mock/withStatefulProfileData";
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
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  const formationNJAddress =
    business && business.formationData.formationFormData.addressMunicipality;

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
        <WithStatefulDataFieldFormContext>
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
            <Profile municipalities={municipalitiesList} />
          </WithStatefulUserData>
        </WithStatefulDataFieldFormContext>
      </ThemeProvider>,
      isAuthenticated ?? IsAuthenticated.TRUE,
      {
        showNeedsAccountModal: false,
        setShowNeedsAccountModal: setShowNeedsAccountModal ?? jest.fn(),
        showContinueWithoutSaving: false,
        setShowContinueWithoutSaving: jest.fn(),
        userWantsToContinueWithoutSaving: false,
        setUserWantsToContinueWithoutSaving: jest.fn(),
      },
    ),
  );
};

export const fillText = (label: string, value: string, selector?: string): void => {
  const options = selector ? { selector } : undefined;
  const element = screen.getByLabelText(label, options);

  fireEvent.change(element, { target: { value: value } });
  fireEvent.blur(element);
};

export const selectByValue = async (label: string, value: string): Promise<void> => {
  const field = await screen.findByLabelText(label);
  fireEvent.mouseDown(field);
  // React 19: Wait for listbox to appear after mouseDown
  const listbox = within(await screen.findByRole("listbox", {}, { timeout: 3000 }));
  fireEvent.click(listbox.getByTestId(value));
};

export const selectByText = async (label: string, value: string): Promise<void> => {
  const field = await screen.findByLabelText(label);
  fireEvent.mouseDown(field);
  // React 19: Wait for listbox to appear after mouseDown
  const listbox = within(await screen.findByRole("listbox", {}, { timeout: 3000 }));
  // React 19: Wait for option to render in listbox
  const option = await listbox.findByText(value, {}, { timeout: 3000 });
  fireEvent.click(option);
};

export const clickBack = async (): Promise<void> => {
  const buttons = await screen.findAllByTestId("back");
  await userEvent.click(buttons[0]);
};

export const clickSave = async (): Promise<void> => {
  const buttons = await screen.findAllByTestId("save");
  await userEvent.click(buttons[0]);
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
  return (screen.queryByLabelText("Notes", { selector: "textarea" }) as HTMLInputElement)?.value;
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

export const removeLocationAndSave = async (): Promise<void> => {
  fillText("Location", "");
  fireEvent.blur(screen.getByLabelText("Location"));
  await clickSave();
};

export const expectLocationSavedAsUndefined = async (): Promise<void> => {
  await waitFor(() => {
    return expect(currentBusiness().profileData.municipality).toEqual(undefined);
  });
};

export const expectLocationNotSavedAndError = (): void => {
  expect(userDataWasNotUpdated()).toBe(true);
  expect(
    screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired),
  ).toBeInTheDocument();
  expect(screen.getByTestId("profile-error-alert")).toBeInTheDocument();
};

export const getForeignNexusProfileFields = (
  businessPersona: BusinessPersona,
): Partial<ProfileData> => {
  return businessPersona === "FOREIGN"
    ? {
        foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
      }
    : {};
};
export const phasesWhereGoToProfileShows = OperatingPhases.filter(
  (it) => it.displayProfileOpportunityAlert,
).map((it) => it.id);

export const phasesWhereGoToProfileDoesNotShow = OperatingPhases.filter(
  (it) => !it.displayProfileOpportunityAlert,
).map((it) => it.id);
