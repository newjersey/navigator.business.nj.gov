import { FormationDateModal } from "@/components/FormationDateModal";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import {
  generateMunicipality,
  generateProfileData,
  generateRoadmap,
  generateUserData,
} from "@/test/factories";
import { withRoadmap } from "@/test/helpers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Dayjs } from "dayjs";

jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/utils/analytics-helpers", () => {
  return { setAnalyticsDimensions: jest.fn() };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});
const Config = getMergedConfig();

const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;
const mockAnalyticsHelpers = analyticsHelpers as jest.Mocked<typeof analyticsHelpers>;

describe("<FormationDateModal />", () => {
  let setRoadmap: jest.Mock;
  const municipality = generateMunicipality({});

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    setRoadmap = jest.fn();
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
  });

  const renderComponent = (initialUserData?: UserData) => {
    const userData = initialUserData ?? generateUserData({});

    const userDataWithMunicipality = {
      ...userData,
      profileData: {
        ...userData.profileData,
        municipality: userData.profileData.municipality !== undefined ? municipality : undefined,
      },
    };

    render(
      withRoadmap(
        <MunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
          <WithStatefulUserData initialUserData={userDataWithMunicipality}>
            <FormationDateModal isOpen={true} close={() => {}} onSave={() => {}} />
          </WithStatefulUserData>
        </MunicipalitiesContext.Provider>,
        generateRoadmap({}),
        undefined,
        setRoadmap
      )
    );
  };

  it("updates date of formation in user data", () => {
    renderComponent();
    const date = getCurrentDate().subtract(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"));
  });

  it("allows a date in the future", () => {
    renderComponent();
    const date = getCurrentDate().add(1, "month").date(1);
    selectDate(date);
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"));
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

  it("shows error when user saves without entering location", () => {
    renderComponent(generateUserData({ profileData: generateProfileData({ municipality: undefined }) }));
    expect(
      screen.queryByText(Config.profileDefaults.STARTING.municipality.errorTextRequired)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    expect(
      screen.getByText(Config.profileDefaults.STARTING.municipality.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("builds roadmap and sets analytics on save", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        municipality: municipality,
        dateOfFormation: getCurrentDate().format("YYYY-MM-DD"),
      }),
    });

    renderComponent(userData);

    const returnedRoadmap = generateRoadmap({});
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(returnedRoadmap);

    fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
    triggerQueueUpdate();
    await waitFor(() => {
      return expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledWith(userData.profileData);
    });
    await waitFor(() => {
      return expect(setRoadmap).toHaveBeenCalledWith(returnedRoadmap);
    });
    expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledWith(userData.profileData);
  });

  const selectDate = (date: Dayjs) => {
    const item = screen.getByLabelText("Date of formation");
    fireEvent.change(item, { target: { value: date.format("MM/YYYY") } });
    fireEvent.blur(item);
  };

  const selectLocationByText = (value: string) => {
    fireEvent.mouseDown(screen.getByLabelText("Location"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };
});
