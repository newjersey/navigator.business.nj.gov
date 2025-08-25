import { SalesInfo } from "@/components/tasks/cigarette-license/fields/SalesInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { getMergedConfig } from "@/contexts/configContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useState } from "react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<SalesInfo />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  const renderComponent = ({
    business,
    userData,
  }: {
    business?: Business;
    userData?: UserData;
    runValidations?: boolean;
  } = {}): void => {
    const testBusiness = business ?? generateBusinessWithDefaults();
    const testUserData = userData ?? generateUserDataForBusiness(testBusiness);

    const TestComponent = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState(emptyCigaretteLicenseData);
      const [profileData, setProfileData] = useState(testBusiness.profileData);

      const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
      return (
        <WithStatefulUserData initialUserData={testUserData}>
          <DataFormErrorMapContext.Provider value={formContextState}>
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
                  <SalesInfo setStepIndex={jest.fn()} />
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
    it("renders section header", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.salesInformationHeader),
      ).toBeInTheDocument();
    });

    it("renders start date of cigarette sales field", () => {
      renderComponent();

      expect(
        screen.getByRole("textbox", { name: "Start Date of Cigarette Sales" }),
      ).toBeInTheDocument();
    });

    it("renders cigarette suppliers dropdown", () => {
      renderComponent();

      expect(screen.getByRole("combobox", { name: "Select a Supplier" })).toBeInTheDocument();
    });
  });

  describe("Field Validation", () => {
    it("renders error for Start Date of Cigarette Sales when empty on blur", async () => {
      renderComponent({});

      await userEvent.click(screen.getByLabelText("Start Date of Cigarette Sales"));
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error for Start Date of Cigarette Sales when invalid date on blur", async () => {
      renderComponent({});

      await userEvent.type(screen.getByLabelText("Start Date of Cigarette Sales"), "000000");
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error for Select Supplier dropdown when no options are selected on blur", async () => {
      renderComponent({});

      const openSupplierDropdownButton = screen.getByRole("button", { name: "Open" });
      await userEvent.click(openSupplierDropdownButton);
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders no error for Select Supplier dropdown when an option is selected", async () => {
      renderComponent({});

      const openSupplierDropdownButton = screen.getByRole("button", { name: "Open" });
      await userEvent.click(openSupplierDropdownButton);
      await userEvent.click(screen.getByRole("option", { name: "A TRENK, INC" }));
      await userEvent.tab();

      expect(
        screen.queryByText(Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText),
      ).not.toBeInTheDocument();
    });

    it("renders an error for Select Supplier dropdown when all selected options are deselected", async () => {
      renderComponent({});

      const openSupplierDropdownButton = screen.getByRole("button", { name: "Open" });
      await userEvent.click(openSupplierDropdownButton);
      await userEvent.click(screen.getByRole("option", { name: "A TRENK, INC" }));
      await userEvent.click(screen.getByRole("option", { name: "A TRENK, INC" }));
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText),
      ).toBeInTheDocument();
    });
  });
});
