import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { getMergedConfig } from "@/contexts/configContext";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { getFlow } from "@/lib/utils/helpers";
import { randomHomeBasedIndustry, randomNonHomeBasedIndustry } from "@/test/factories";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { fireEvent, render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<OnboardingIndustry />", () => {
  const renderComponent = (profileData?: ProfileData) => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <OnboardingIndustry onValidation={() => {}} fieldStates={createProfileFieldErrorMap()} />
      </WithStatefulProfileData>
    );
  };

  it("displays industry-specific content for home contractors when selected", () => {
    renderComponent();
    expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();

    selectIndustry("home-contractor");
    expect(screen.getByTestId("industry-specific-home-contractor")).toBeInTheDocument();

    selectIndustry("e-commerce");
    expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();
  });

  it("displays industry-specific content for employment agency when selected", () => {
    renderComponent();
    expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();

    selectIndustry("employment-agency");
    expect(screen.getByTestId("industry-specific-employment-agency")).toBeInTheDocument();

    selectIndustry("e-commerce");
    expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();
  });

  it("displays liquor license question for restaurants when selected", () => {
    const profileData = createEmptyProfileData();
    renderComponent(profileData);

    expect(
      screen.queryByText(Config.profileDefaults[getFlow(profileData)].liquorLicense.description)
    ).not.toBeInTheDocument();

    selectIndustry("restaurant");
    expect(
      screen.getByText(Config.profileDefaults[getFlow(profileData)].liquorLicense.description)
    ).toBeInTheDocument();

    chooseRadio("liquor-license-radio-true");
    expect(currentProfileData().liquorLicense).toEqual(true);
  });

  describe("when industry changes", () => {
    it("sets liquor license back to false if they select a different industry", () => {
      renderComponent();

      selectIndustry("restaurant");
      chooseRadio("liquor-license-radio-true");
      expect(currentProfileData().liquorLicense).toEqual(true);

      selectIndustry("cosmetology");
      expect(currentProfileData().liquorLicense).toEqual(false);
    });

    it("sets sector for industry", async () => {
      renderComponent();
      selectIndustry("restaurant");
      expect(currentProfileData().sectorId).toEqual("accommodation-and-food-services");

      selectIndustry("cannabis");
      expect(currentProfileData().sectorId).toEqual("cannabis");
    });

    describe("updates to industry affecting home-based business", () => {
      it("sets home-based business to false if they select an non-applicable industry", async () => {
        renderComponent();
        selectIndustry(randomNonHomeBasedIndustry());
        expect(currentProfileData().homeBasedBusiness).toEqual(false);
      });

      it("sets home-based business to undefined if they select an applicable industry", async () => {
        renderComponent();
        selectIndustry(randomHomeBasedIndustry());
        expect(currentProfileData().homeBasedBusiness).toEqual(undefined);
      });
    });

    describe("cannabis license type question", () => {
      it("displays cannabis license type question for cannabis only", () => {
        renderComponent();
        expect(screen.queryByTestId("industry-specific-cannabis")).not.toBeInTheDocument();

        selectIndustry("cannabis");
        expect(screen.getByTestId("industry-specific-cannabis")).toBeInTheDocument();

        selectIndustry("generic");
        expect(screen.queryByTestId("industry-specific-cannabis")).not.toBeInTheDocument();
      });

      it("defaults cannabis license type to CONDITIONAL", () => {
        renderComponent();
        selectIndustry("cannabis");
        expect(currentProfileData().cannabisLicenseType).toEqual("CONDITIONAL");
      });

      it("allows switching cannabis license type to ANNUAL", async () => {
        renderComponent();
        selectIndustry("cannabis");

        chooseRadio("cannabis-license-type-radio-annual");
        expect(currentProfileData().cannabisLicenseType).toEqual("ANNUAL");
      });

      it("sets cannabis license type to back undefined when switching back to non-cannabis industry", () => {
        renderComponent();

        selectIndustry("cannabis");
        expect(currentProfileData().cannabisLicenseType).toEqual("CONDITIONAL");

        selectIndustry("generic");
        expect(currentProfileData().cannabisLicenseType).toBeUndefined();
      });
    });

    describe("car service type question", () => {
      it("displays car service question for car service only", () => {
        renderComponent();
        expect(screen.queryByTestId("industry-specific-car-service")).not.toBeInTheDocument();

        selectIndustry("car-service");
        expect(screen.getByTestId("industry-specific-car-service")).toBeInTheDocument();

        selectIndustry("generic");
        expect(screen.queryByTestId("industry-specific-car-service")).not.toBeInTheDocument();
      });

      it("updates carServiceType to STANDARD if the standard radio button is picked", () => {
        renderComponent();

        selectIndustry("car-service");
        fireEvent.click(screen.getByText(Config.profileDefaults.STARTING.carService.radioButtonStandardText));

        expect(currentProfileData().carService).toBe("STANDARD");
      });

      it("updates carServiceType to HIGH_CAPACITY if the high capacity radio button is picked", () => {
        renderComponent();

        selectIndustry("car-service");
        fireEvent.click(
          screen.getByText(Config.profileDefaults.STARTING.carService.radioButtonHighCapacityText)
        );
        expect(currentProfileData().carService).toBe("HIGH_CAPACITY");
      });

      it("updates carServiceType to BOTH if the both radio button is picked", () => {
        renderComponent();
        selectIndustry("car-service");
        fireEvent.click(screen.getByText(Config.profileDefaults.STARTING.carService.radioButtonBothText));
        expect(currentProfileData().carService).toBe("BOTH");
      });
    });
  });

  const selectIndustry = (value: string) => {
    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(screen.getByTestId(value));
  };
});
