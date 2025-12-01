import { SalesInfo } from "@/components/tasks/cigarette-license/SalesInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";

import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { emptyCigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SUPPLIER_NAMES } from "@/components/tasks/cigarette-license/fields/CigaretteSupplierDropdown";
import { useState } from "react";

const Config = getMergedConfig();

describe("<SalesInfo />", () => {
  const renderComponent = ({
    business,
    userData,
  }: {
    business?: Business;
    userData?: UserData;
    runValidations?: boolean;
  } = {}): void => {
    const testBusiness =
      business ?? generateBusiness({ cigaretteLicenseData: emptyCigaretteLicenseData });
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
                  saveCigaretteLicenseData: jest.fn(),
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
                  <SalesInfo setStepIndex={() => {}} />
                </ProfileDataContext.Provider>
              </CigaretteLicenseContext.Provider>
            </AddressContext.Provider>
          </DataFormErrorMapContext.Provider>
        </WithStatefulUserData>
      );
    };

    render(<TestComponent />);
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
        screen.getByRole("textbox", {
          name: Config.cigaretteLicenseStep3.fields.startDateOfSales.label,
        }),
      ).toBeInTheDocument();
    });

    it("renders cigarette suppliers dropdown", () => {
      renderComponent();

      expect(
        screen.getByRole("combobox", {
          name: Config.cigaretteLicenseStep3.fields.selectASupplier.label,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Field Validation", () => {
    it("renders error for Start Date of Cigarette Sales when empty on blur", async () => {
      renderComponent({});

      await userEvent.click(
        screen.getByLabelText(Config.cigaretteLicenseStep3.fields.startDateOfSales.label),
      );
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error for Start Date of Cigarette Sales when invalid date on blur", async () => {
      renderComponent({});

      await userEvent.type(
        screen.getByLabelText(Config.cigaretteLicenseStep3.fields.startDateOfSales.label),
        "000000",
      );
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

    it("removes error for Select Supplier dropdown when an option is selected", async () => {
      renderComponent({});

      const openSupplierDropdownButton = screen.getByRole("button", { name: "Open" });
      await userEvent.click(openSupplierDropdownButton);
      await userEvent.tab();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText),
      ).toBeInTheDocument();

      await userEvent.click(openSupplierDropdownButton);
      await userEvent.click(screen.getByRole("option", { name: SUPPLIER_NAMES[0] }));
      await userEvent.tab();

      expect(
        screen.queryByText(Config.cigaretteLicenseStep3.fields.selectASupplier.errorRequiredText),
      ).not.toBeInTheDocument();
    });
  });
});
