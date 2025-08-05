import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { getMergedConfig } from "@/contexts/configContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import * as useAddressErrorsModule from "@/lib/data-hooks/useAddressErrors";
import * as useConfigModule from "@/lib/data-hooks/useConfig";
import * as useUserDataModule from "@/lib/data-hooks/useUserData";

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
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useConfig", () => ({ useConfig: jest.fn() }));
jest.mock("@/lib/data-hooks/useAddressErrors", () => ({ useAddressErrors: jest.fn() }));

const mockUseConfig = useConfigModule.useConfig as jest.MockedFunction<
  typeof useConfigModule.useConfig
>;
const mockUseUserData = useUserDataModule.useUserData as jest.MockedFunction<
  typeof useUserDataModule.useUserData
>;
const mockUseAddressErrors = useAddressErrorsModule.useAddressErrors as jest.MockedFunction<
  typeof useAddressErrorsModule.useAddressErrors
>;

describe("<LicenseeInfo />", () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ Config });
    mockUseAddressErrors.mockReturnValue({
      doesFieldHaveError: jest.fn().mockReturnValue(false),
      doSomeFieldsHaveError: jest.fn().mockReturnValue(false),
      getFieldErrorLabel: jest.fn().mockReturnValue(""),
      doesRequiredFieldHaveError: jest.fn().mockReturnValue(false),
    });
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

    mockUseUserData.mockReturnValue({
      userData: testUserData,
      business: testBusiness,
      isLoading: false,
      error: undefined,
      hasCompletedFetch: true,
      updateQueue: undefined,
      createUpdateQueue: jest.fn(),
      refresh: jest.fn(),
    });

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

      // Verify we have both business and mailing address fields (2 of each type)
      const addressLine1Fields = screen.getAllByRole("textbox", { name: /address line1/i });
      const addressCityFields = screen.getAllByRole("textbox", { name: /address city/i });
      const addressStateFields = screen.getAllByRole("combobox", { name: /address state/i });
      const addressZipFields = screen.getAllByRole("textbox", { name: /address zip code/i });

      expect(addressLine1Fields).toHaveLength(2);
      expect(addressCityFields).toHaveLength(2);
      expect(addressStateFields).toHaveLength(2);
      expect(addressZipFields).toHaveLength(2);
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

    it("allows user interaction with business name field", () => {
      renderComponent();

      const businessNameField = screen.getByRole("textbox", { name: /business name/i });

      fireEvent.change(businessNameField, { target: { value: "New Business Name" } });
      expect(businessNameField).toHaveValue("New Business Name");

      expect(businessNameField).toHaveAttribute("aria-label", "Business name");
    });
  });

  describe("Navigation", () => {
    it("calls setStepIndex when back button is clicked", () => {
      const mockSetStepIndex = jest.fn();

      renderComponent({
        setStepIndex: mockSetStepIndex,
        runValidations: false,
      });

      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);

      expect(mockSetStepIndex).toHaveBeenCalledWith(0);
    });
  });
});
