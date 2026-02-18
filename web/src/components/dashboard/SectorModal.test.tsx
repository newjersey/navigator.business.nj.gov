import { SectorModal } from "@/components/dashboard/SectorModal";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import { findButton } from "@/test/helpers/accessible-queries";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const submitSectorModal = async (): Promise<void> => {
  const button = await findButton(Config.dashboardDefaults.sectorModalSaveButton);
  await userEvent.click(button);
};

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<SectorModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderSectorModal = (onContinue?: jest.Mock): { page: PageHelpers } => {
    render(
      <SectorModal
        open={true}
        handleClose={(): void => {}}
        onContinue={onContinue ?? ((): void => {})}
      />,
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

  it("fires validations when clicking submit", async () => {
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
    const onContinue = jest.fn();
    renderSectorModal(onContinue);
    await submitSectorModal();
    expect(onContinue).not.toHaveBeenCalled();
    expect(
      await screen.findByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired),
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
    const onContinue = jest.fn();
    const { page } = renderSectorModal(onContinue);
    await page.selectByValue("Sector", "clean-energy");
    await submitSectorModal();
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled();
    });
  });
});
