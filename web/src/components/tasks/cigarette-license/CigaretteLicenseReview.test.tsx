import { CigaretteLicenseReview } from "@/components/tasks/cigarette-license/CigaretteLicenseReview";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { emptyCigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("<CigaretteLicenseReview />", () => {
  const mockSetStepIndex = jest.fn();
  const mockSetSubmissionError = jest.fn();
  const mockErrorAlertRef = {
    current: {} as HTMLDivElement,
  };

  const renderComponent = ({
    business,
    userData,
  }: {
    business?: Business;
    userData?: UserData;
  } = {}): void => {
    const testBusiness = business ?? generateBusiness({});
    const testUserData = userData ?? generateUserDataForBusiness(testBusiness);

    const TestComponent = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState(
        testBusiness.cigaretteLicenseData || emptyCigaretteLicenseData,
      );
      const [profileData, setProfileData] = useState(testBusiness.profileData);

      const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
      return (
        <WithStatefulUserData initialUserData={testUserData}>
          <DataFormErrorMapContext.Provider value={formContextState}>
            <AddressContext.Provider
              value={{
                state: {
                  formationAddressData:
                    testBusiness.formationData?.formationFormData || emptyFormationAddressData,
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
                  <CigaretteLicenseReview
                    setStepIndex={mockSetStepIndex}
                    setSubmissionError={mockSetSubmissionError}
                    errorAlertRef={mockErrorAlertRef}
                  />
                </ProfileDataContext.Provider>
              </CigaretteLicenseContext.Provider>
            </AddressContext.Provider>
          </DataFormErrorMapContext.Provider>
        </WithStatefulUserData>
      );
    };

    render(<TestComponent />);
  };

  describe("Review Fields Rendering", () => {
    it("renders main section headers", () => {
      renderComponent();

      expect(screen.getByText("Licensee Information")).toBeInTheDocument();
      expect(screen.getByText("Sales Information")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Signers")).toBeInTheDocument();
    });

    it("renders business address section", () => {
      renderComponent();

      expect(screen.getByText("Business Address")).toBeInTheDocument();
    });

    it("renders mailing address section", () => {
      renderComponent();

      expect(screen.getByText("Mailing Address")).toBeInTheDocument();
    });

    it("renders contact information section", () => {
      renderComponent();

      expect(screen.getByText("Contact Information")).toBeInTheDocument();
    });

    it("renders submit and pay button", () => {
      renderComponent();

      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Submit and Pay" })).toBeInTheDocument();
    });

    it("renders signers section", () => {
      renderComponent();
      expect(screen.getByText("Signers")).toBeInTheDocument();
    });
  });

  describe("Business Type Conditional Rendering", () => {
    it("shows business name for LLC business type", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
        }),
      });
      renderComponent({ business });

      expect(screen.getByText("Business Name")).toBeInTheDocument();
      expect(screen.queryByText("Responsible Owner Name")).not.toBeInTheDocument();
      expect(screen.queryByText("Trade Name")).not.toBeInTheDocument();
    });

    it("shows responsible owner name and trade name for sole proprietorship", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderComponent({ business });

      expect(screen.getByText("Responsible Owner Name")).toBeInTheDocument();
      expect(screen.getByText("Trade Name")).toBeInTheDocument();
      expect(screen.queryByText("Business Name")).not.toBeInTheDocument();
    });

    it("shows responsible owner name and trade name for partnership", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "general-partnership",
        }),
      });
      renderComponent({ business });

      expect(screen.getByText("Responsible Owner Name")).toBeInTheDocument();
      expect(screen.getByText("Trade Name")).toBeInTheDocument();
      expect(screen.queryByText("Business Name")).not.toBeInTheDocument();
    });
  });

  describe("Edit Functionality", () => {
    it("shows edit button for licensee information section", async () => {
      renderComponent();

      expect(screen.getByRole("button", { name: "Edit Licensee Information" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Edit Licensee Information" }));
      expect(mockSetStepIndex).toHaveBeenCalledWith(1);
    });

    it("shows edit button for sales information section", async () => {
      renderComponent();

      expect(screen.getByRole("button", { name: "Edit Sales Information" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Edit Sales Information" }));
      expect(mockSetStepIndex).toHaveBeenCalledWith(2);
    });
  });

  describe("Mailing Address Display Logic", () => {
    it("displays business address values when mailing address checkbox is checked", () => {
      const business = generateBusiness({
        cigaretteLicenseData: {
          mailingAddressIsTheSame: true,
          addressLine1: "123 Business St",
          addressLine2: "Suite 100",
          addressCity: "Business City",
          addressState: { name: "New Jersey", shortCode: "NJ" },
          addressZipCode: "12345",
          mailingAddressLine1: "456 Mailing Ave",
          mailingAddressLine2: "Apt 200",
          mailingAddressCity: "Mailing City",
          mailingAddressState: { name: "New York", shortCode: "NY" },
          mailingAddressZipCode: "67890",
        },
      });
      renderComponent({ business });

      expect(screen.getByTestId("mailing-address-line1")).toHaveTextContent("123 Business St");
      expect(screen.getByTestId("mailing-address-line2")).toHaveTextContent("Suite 100");
      expect(screen.getByTestId("mailing-address-city")).toHaveTextContent("Business City");
      expect(screen.getByTestId("mailing-address-state")).toHaveTextContent("New Jersey");
      expect(screen.getByTestId("mailing-address-zipcode")).toHaveTextContent("12345");

      expect(screen.getByTestId("mailing-address-line1")).not.toHaveTextContent("456 Mailing Ave");
      expect(screen.getByTestId("mailing-address-line2")).not.toHaveTextContent("Apt 200");
      expect(screen.getByTestId("mailing-address-city")).not.toHaveTextContent("Mailing City");
      expect(screen.getByTestId("mailing-address-state")).not.toHaveTextContent("New York");
      expect(screen.getByTestId("mailing-address-zipcode")).not.toHaveTextContent("67890");
    });

    it("displays mailing address values when mailing address checkbox is unchecked", () => {
      const business = generateBusiness({
        cigaretteLicenseData: {
          mailingAddressIsTheSame: false,
          addressLine1: "123 Business St",
          addressLine2: "Suite 100",
          addressCity: "Business City",
          addressState: { name: "New Jersey", shortCode: "NJ" },
          addressZipCode: "12345",
          mailingAddressLine1: "456 Mailing Ave",
          mailingAddressLine2: "Apt 200",
          mailingAddressCity: "Mailing City",
          mailingAddressState: { name: "New York", shortCode: "NY" },
          mailingAddressZipCode: "67890",
        },
      });
      renderComponent({ business });

      expect(screen.getByText("456 Mailing Ave")).toBeInTheDocument();
      expect(screen.getByText("Apt 200")).toBeInTheDocument();
      expect(screen.getByText("Mailing City")).toBeInTheDocument();
      expect(screen.getByText("New York")).toBeInTheDocument();
      expect(screen.getByText("67890")).toBeInTheDocument();

      expect(screen.getByTestId("mailing-address-line1")).not.toHaveTextContent("123 Business St");
      expect(screen.getByTestId("mailing-address-line2")).not.toHaveTextContent("Suite 100");
      expect(screen.getByTestId("mailing-address-city")).not.toHaveTextContent("Business City");
      expect(screen.getByTestId("mailing-address-state")).not.toHaveTextContent("New Jersey");
      expect(screen.getByTestId("mailing-address-zipcode")).not.toHaveTextContent("12345");
    });
  });
});
