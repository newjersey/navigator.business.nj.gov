import { CertificationsAndFundingNonEssentialQuestions } from "@/components/data-fields/non-essential-questions/CertificationsAndFundingNonEssentialQuestions";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusinessForProfile } from "@/test/pages/profile/profile-helpers";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("CertificationsAndFundingNonEssentialQuestions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (profileData: ProfileData): void => {
    render(
      <DataFormErrorMapContext.Provider
        value={{
          fieldStates: createDataFormErrorMap(),
          runValidations: false,
          reducer: () => {},
        }}
      >
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
            },
            setProfileData: (): void => {},
            onBack: (): void => {},
          }}
        >
          <CertificationsAndFundingNonEssentialQuestions />
        </ProfileDataContext.Provider>
      </DataFormErrorMapContext.Provider>,
    );
  };

  it("only shows municipality questions for starting businesses", () => {
    const profileData = generateProfileData({
      operatingPhase: OperatingPhaseId.GUEST_MODE,
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.getByRole("combobox", {
        name: "Location",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("combobox", {
        name: "Ownership",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("textbox", {
        name: "Existing employees",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows all questions for operating businesses", () => {
    const profileData = generateProfileData({
      operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.getByRole("combobox", {
        name: "Location",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Ownership",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Existing employees",
      }),
    ).toBeInTheDocument();
  });
});
