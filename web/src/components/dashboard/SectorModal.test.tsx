import { SectorModal } from "@/components/dashboard/SectorModal";
import { getMergedConfig } from "@/contexts/configContext";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { generateProfileData, generateUserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

const submitSectorModal = (): void => {
  fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
};

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<SectorModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  const renderSectorModal = (onContinue?: jest.Mock): { page: PageHelpers } => {
    render(
      <SectorModal open={true} handleClose={(): void => {}} onContinue={onContinue ?? ((): void => {})} />
    );
    const page = createPageHelpers();
    return { page };
  };

  it("shows sector for generic industry", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: "generic",
        businessPersona: "STARTING",
        sectorId: undefined,
      }),
    });

    useMockUserData(userData);
    renderSectorModal();

    expect((screen.getByLabelText("Sector") as HTMLInputElement)?.value).toEqual("");
  });

  it("fires validations when clicking submit", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: undefined,
        sectorId: undefined,
        industryId: undefined,
        ownershipTypeIds: [],
        existingEmployees: undefined,
      }),
    });

    useMockUserData(userData);
    const onContinue = jest.fn();
    renderSectorModal(onContinue);
    submitSectorModal();
    expect(onContinue).not.toHaveBeenCalled();
    expect(
      screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("calls onContinue prop on successful submit", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        sectorId: undefined,
        industryId: "generic",
      }),
    });

    useMockUserData(userData);
    const onContinue = jest.fn();
    const { page } = renderSectorModal(onContinue);
    page.selectByValue("Sector", "clean-energy");
    submitSectorModal();
    expect(onContinue).toHaveBeenCalled();
  });
});
