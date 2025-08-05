import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { getMergedConfig } from "@/contexts/configContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { emptyCigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<LicenseeInfo />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  const renderComponent = ({
    business,
    userData,
    setStepIndex = jest.fn(),
    runValidations = true,
  }: {
    business?: Business;
    userData?: UserData;
    setStepIndex?: (idx: number) => void;
    runValidations?: boolean;
  } = {}): void => {
    const testBusiness = business ?? generateBusinessWithDefaults();
    const testUserData = userData ?? generateUserDataForBusiness(testBusiness);

    const TestComponent = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState(emptyCigaretteLicenseData);
      const [profileData, setProfileData] = useState(testBusiness.profileData);

      return (
        <WithStatefulUserData initialUserData={testUserData}>
          <DataFormErrorMapContext.Provider
            value={{
              fieldStates: createDataFormErrorMap(),
              runValidations,
              reducer: () => {},
            }}
          >
            <AddressContext.Provider
              value={{
                state: {
                  formationAddressData: emptyFormationAddressData,
                },
                setAddressData: jest.fn(),
              }}
            >
              <CigaretteLicenseContext.Provider
                value={{
                  state: cigaretteLicenseData,
                  setCigaretteLicenseData,
                }}
              >
                <ProfileDataContext.Provider
                  value={{
                    state: {
                      profileData,
                      flow: "STARTING",
                    },
                    setProfileData,
                    onBack: (): void => {},
                  }}
                >
                  <LicenseeInfo setStepIndex={setStepIndex} />
                </ProfileDataContext.Provider>
              </CigaretteLicenseContext.Provider>
            </AddressContext.Provider>
          </DataFormErrorMapContext.Provider>
        </WithStatefulUserData>
      );
    };

    render(<TestComponent />);
  };

  const generateBusinessWithDefaults = (overrides?: Partial<Business>): Business => {
    return generateBusiness({
      profileData: generateProfileData({
        businessName: "Test Business",
        responsibleOwnerName: "John Doe",
        tradeName: "Test Trade Name",
        taxId: "123456789000",
        encryptedTaxId: "123456789000",
        legalStructureId: "limited-liability-company",
      }),
      formationData: generateFormationData({
        formationFormData: generateFormationFormData({
          addressLine1: "123 Test St",
          addressLine2: "Suite 100",
          addressCity: "Test City",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressZipCode: "12345",
        }),
      }),
      ...overrides,
    });
  };

  describe("Form Fields", () => {
    it("renders main section headers", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationDescription),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.businessAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.mailingAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.contactInformationHeader),
      ).toBeInTheDocument();
    });

    it("renders business information fields", () => {
      renderComponent();

      expect(screen.getByRole("textbox", { name: /business name/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    });

    it("renders both business and mailing address fields", () => {
      renderComponent();

      const businessAddressContainer = within(screen.getByTestId("business-address-section"));
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address line1/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address city/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("combobox", { name: /address state/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address zip code/i }),
      ).toBeInTheDocument();

      const mailingAddressContainer = within(screen.getByTestId("mailing-address-section"));
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address line1/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address city/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("combobox", { name: /address state/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address zip code/i }),
      ).toBeInTheDocument();
    });

    it("renders contact information fields", () => {
      renderComponent();

      expect(screen.getByRole("textbox", { name: /contact name/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /contact phone number/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /contact email/i })).toBeInTheDocument();
    });

    it("pre-populates from business data", async () => {
      renderComponent();

      const businessNameField = screen.getByRole("textbox", { name: /business name/i });
      expect(businessNameField).toBeInTheDocument();
      expect(businessNameField).toHaveValue("Test Business");
    });

    it("allows user interaction with business name field", async () => {
      renderComponent();

      const businessNameField = screen.getByRole("textbox", { name: /business name/i });
      await userEvent.clear(businessNameField);
      await userEvent.type(businessNameField, "New Business Name");
      await userEvent.tab();

      expect(businessNameField).toHaveValue("New Business Name");
      expect(businessNameField).toHaveAttribute("aria-label", "Business name");
    });
  });
});
