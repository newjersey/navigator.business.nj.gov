import { LocationBasedNonEssentialQuestions } from "@/components/data-fields/non-essential-questions/LocationBasedNonEssentialQuestions";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { randomHomeBasedIndustry, randomNonHomeBasedIndustry } from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { useMockIntersectionObserver } from "@/test/mock/MockIntersectionObserver";
import { generateBusinessForProfile } from "@/test/pages/profile/profile-helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { OperatingPhase, OperatingPhases } from "@businessnjgovnavigator/shared/operatingPhase";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

jest.mock("@/lib/utils/useIntersectionOnElement", () => ({
  useIntersectionOnElement: jest.fn(),
}));

describe("LocationBasedNonEssentialQuestions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockIntersectionObserver();
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
          <LocationBasedNonEssentialQuestions />
        </ProfileDataContext.Provider>
      </DataFormErrorMapContext.Provider>,
    );
  };

  it("displays all location questions if the business should see them", async () => {
    const profileData = generateProfileData({
      homeBasedBusiness: false,
      businessPersona: "STARTING",
      industryId: randomHomeBasedIndustry(),
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.getByRole("radiogroup", {
        name: "Home based business",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Planned renovation question",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Elevator owning business",
      }),
    ).toBeInTheDocument();
  });

  it("only display home based question if business is home based", async () => {
    const profileData = generateProfileData({
      homeBasedBusiness: true,
      businessPersona: "STARTING",
      industryId: randomHomeBasedIndustry(),
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.getByRole("radiogroup", {
        name: "Home based business",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", {
        name: "Planned renovation question",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", {
        name: "Elevator owning business",
      }),
    ).not.toBeInTheDocument();
  });

  it("only display planned renovation and elevator for non home based industries", async () => {
    const profileData = generateProfileData({
      homeBasedBusiness: false,
      businessPersona: "STARTING",
      industryId: randomNonHomeBasedIndustry(),
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.queryByRole("radiogroup", {
        name: "Home based business",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Planned renovation question",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", {
        name: "Elevator owning business",
      }),
    ).toBeInTheDocument();
  });

  it("displays alt description for home based business question when applicable", async () => {
    const Config = getMergedConfig();
    const altDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAltHomeBasedBusinessDescription;
    });
    const persona: Partial<ProfileData> = randomElementFromArray([
      { businessPersona: "STARTING" },
      { businessPersona: "OWNING" },
      { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["propertyInNJ"] },
    ]);

    const profileData = generateProfileData({
      homeBasedBusiness: true,
      businessPersona: "STARTING",
      industryId: randomHomeBasedIndustry(),
      operatingPhase: randomElementFromArray(altDescOperatingPhases as OperatingPhase[]).id,
      ...persona,
    });

    useMockBusiness(generateBusinessForProfile({ profileData: profileData }));
    renderComponent(profileData);

    expect(
      screen.getByRole("radiogroup", {
        name: "Home based business",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription),
    ).toBeInTheDocument();
  });
});
