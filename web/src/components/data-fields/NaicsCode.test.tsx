import { NaicsCode } from "@/components/data-fields/NaicsCode";
import { getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getFlow } from "@/lib/utils/helpers";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  TaxFilingState,
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
const Config = getMergedConfig();

const renderComponent = (businessOverrides: Partial<Business>): void => {
  const data = generateProfileData({
    businessPersona: "STARTING",
    ...businessOverrides.profileData,
  });
  render(
    <ThemeProvider theme={createTheme()}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: data,
            flow: getFlow(data),
          },
          setProfileData: (): void => {},
          onBack: (): void => {},
        }}
      >
        <WithStatefulUserData
          initialUserData={generateUserDataForBusiness(generateBusiness(businessOverrides))}
        >
          <NaicsCode />
        </WithStatefulUserData>
      </ProfileDataContext.Provider>
    </ThemeProvider>
  );
};

describe("<NaicsCode />", () => {
  const configForField = Config.profileDefaults.fields.naicsCode.default;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  it("routes to naics code URL", () => {
    useMockRoadmapTask({ id: "determine-naics-code", urlSlug: "some-naics-url" });
    renderComponent({});
    expect(screen.getByText(configForField.editText)).toHaveAttribute("href", "/tasks/some-naics-url");
  });

  it("displays NAICS code when exists", () => {
    renderComponent({ profileData: generateProfileData({ naicsCode: "123456" }) });
    expect(screen.queryByTestId("not-entered")).not.toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
  });

  it("display Edit when there is naics code", () => {
    renderComponent({ profileData: generateProfileData({ naicsCode: "123456" }) });
    expect(screen.getByText(configForField.editText)).toBeInTheDocument();
    expect(screen.queryByText(configForField.addText)).not.toBeInTheDocument();
  });

  it("displays Not Entered text when user has no NAICS code", () => {
    renderComponent({ profileData: generateProfileData({ naicsCode: "" }) });
    expect(screen.getByText(configForField.notEnteredText)).toBeInTheDocument();
  });

  it("displays Add text when naics code field is empty", () => {
    renderComponent({ profileData: generateProfileData({ naicsCode: "" }) });
    expect(screen.getByText(configForField.addText)).toBeInTheDocument();
    expect(screen.queryByText(configForField.editText)).not.toBeInTheDocument();
  });

  describe("when starting", () => {
    it("doesn't display Edit text and displays tooltip when there is a naics code and tax filing state is success", () => {
      renderComponent({
        profileData: generateProfileData({
          naicsCode: "624410",
        }),
        taxFilingData: generateTaxFilingData({ state: "SUCCESS" }),
      });
      expect(screen.queryByText(configForField.editText)).not.toBeInTheDocument();
      expect(screen.getByTestId("naics-code-tooltip")).toBeInTheDocument();
    });

    describe("tax filing states other than success", () => {
      const taxFilingStates = ["FAILED", "API_ERROR", "PENDING", "UNREGISTERED"];
      for (const state of taxFilingStates) {
        it(`displays Edit text and doesn't display tooltip when tax filing state is ${state}`, () => {
          renderComponent({
            profileData: generateProfileData({
              naicsCode: "624410",
            }),
            taxFilingData: generateTaxFilingData({ state: state as TaxFilingState }),
          });
          expect(screen.getByText(configForField.editText)).toBeInTheDocument();
          expect(screen.queryByTestId("naics-code-tooltip")).not.toBeInTheDocument();
        });
      }
    });
  });

  it("doesn't display Edit text and displays tooltip when there is a naics code is owning", () => {
    renderComponent({
      profileData: generateProfileData({
        naicsCode: "624410",
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        businessPersona: "OWNING",
      }),
    });
    expect(screen.queryByText(configForField.editText)).not.toBeInTheDocument();
    expect(screen.getByTestId("naics-code-tooltip")).toBeInTheDocument();
  });

  it("doesn't display Edit text and displays tooltip when there is a naics code, tax filing state is success and is nexus", () => {
    renderComponent({
      profileData: generateProfileData({
        naicsCode: "624410",
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
      }),
      taxFilingData: generateTaxFilingData({
        state: "SUCCESS",
      }),
    });
    expect(screen.queryByText(configForField.editText)).not.toBeInTheDocument();
    expect(screen.getByTestId("naics-code-tooltip")).toBeInTheDocument();
  });
});
