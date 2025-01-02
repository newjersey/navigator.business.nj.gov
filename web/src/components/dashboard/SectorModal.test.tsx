import { SectorModal } from "@/components/dashboard/SectorModal";
import { getMergedConfig } from "@/contexts/configContext";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const submitSectorModal = (): void => {
  fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
};

const Config = getMergedConfig();

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("<SectorModal />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockBusiness({});
  });

  const renderSectorModal = (onContinue?: vi.Mock): { page: PageHelpers } => {
    render(
      <SectorModal open={true} handleClose={(): void => {}} onContinue={onContinue ?? ((): void => {})} />
    );
    const page = createPageHelpers();
    return { page };
  };

  it("shows sector for generic industry", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        industryId: "generic",
        businessPersona: "STARTING",
        sectorId: undefined,
      }),
    });

    useMockBusiness(business);
    renderSectorModal();

    expect((screen.getByLabelText("Sector") as HTMLInputElement)?.value).toEqual("");
  });

  it("fires validations when clicking submit", () => {
    const business = generateBusiness({
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

    useMockBusiness(business);
    const onContinue = vi.fn();
    renderSectorModal(onContinue);
    submitSectorModal();
    expect(onContinue).not.toHaveBeenCalled();
    expect(
      screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("calls onContinue prop on successful submit", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        sectorId: undefined,
        industryId: "generic",
      }),
    });

    useMockBusiness(business);
    const onContinue = vi.fn();
    const { page } = renderSectorModal(onContinue);
    page.selectByValue("Sector", "clean-energy");
    submitSectorModal();
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled();
    });
  });
});
