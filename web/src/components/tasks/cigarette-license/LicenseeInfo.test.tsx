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
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  const renderComponent = (overrides?: Partial<Business>): void => {
    const business = generateBusiness({
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

    const userData = generateUserDataForBusiness(business);
    mockUseUserData.mockReturnValue({
      userData,
      business,
      isLoading: false,
      error: undefined,
      hasCompletedFetch: true,
      updateQueue: undefined,
      createUpdateQueue: jest.fn(),
      refresh: jest.fn(),
    });

    const TestWrapper = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] =
        useState<CigaretteLicenseData>(emptyCigaretteLicenseData);
      const [profileData, setProfileData] = useState<ProfileData>(business.profileData);

      return (
        <WithStatefulUserData initialUserData={userData}>
          <DataFormErrorMapContext.Provider
            value={{
              fieldStates: createDataFormErrorMap(),
              runValidations: false,
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
                  <LicenseeInfo setStepIndex={jest.fn()} />
                </ProfileDataContext.Provider>
              </CigaretteLicenseContext.Provider>
            </AddressContext.Provider>
          </DataFormErrorMapContext.Provider>
        </WithStatefulUserData>
      );
    };

    render(<TestWrapper />);
  };

  describe("Form Fields", () => {
    it("renders all required fields", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationDescription),
      ).toBeInTheDocument();
    });

    it("pre-populates from business data", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: /business name/i })).toBeInTheDocument();
      });
    });

    it("allows user interaction with business name field", () => {
      renderComponent();

      // Find and interact with business name field
      const businessNameField = screen.getByRole("textbox", { name: /business name/i });

      // Verify the field is interactive
      fireEvent.change(businessNameField, { target: { value: "New Business Name" } });
      expect(businessNameField).toHaveValue("New Business Name");

      // Verify accessibility attributes
      expect(businessNameField).toHaveAttribute("aria-label", "Business name");
    });
  });

  describe("Address Integration", () => {
    it("renders mailing address component", () => {
      renderComponent();

      expect(screen.getByText("Mailing Address")).toBeInTheDocument();
    });

    it("shows different address checkbox", () => {
      renderComponent();

      expect(
        screen.getByText("Mailing address is the same as the business address"),
      ).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("calls setStepIndex when back button is clicked", () => {
      const mockSetStepIndex = jest.fn();

      const TestWrapper = (): JSX.Element => {
        const [cigaretteLicenseData, setCigaretteLicenseData] =
          useState<CigaretteLicenseData>(emptyCigaretteLicenseData);
        const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

        const business = generateBusiness({
          profileData: generateProfileData({
            businessName: "Test Business",
            responsibleOwnerName: "John Doe",
            tradeName: "Test Trade Name",
            taxId: "123456789000",
            encryptedTaxId: "123456789000",
            legalStructureId: "limited-liability-company",
          }),
        });

        const userData = generateUserDataForBusiness(business);

        return (
          <WithStatefulUserData initialUserData={userData}>
            <DataFormErrorMapContext.Provider
              value={{
                fieldStates: createDataFormErrorMap(),
                runValidations: false,
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
                    <LicenseeInfo setStepIndex={mockSetStepIndex} />
                  </ProfileDataContext.Provider>
                </CigaretteLicenseContext.Provider>
              </AddressContext.Provider>
            </DataFormErrorMapContext.Provider>
          </WithStatefulUserData>
        );
      };

      render(<TestWrapper />);

      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);

      expect(mockSetStepIndex).toHaveBeenCalledWith(0);
    });
  });
});
