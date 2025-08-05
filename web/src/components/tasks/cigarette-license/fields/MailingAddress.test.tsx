import { MailingAddress } from "@/components/tasks/cigarette-license/fields/MailingAddress";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("<MailingAddress />", () => {
  const renderComponent = (initialData?: Partial<CigaretteLicenseData>): void => {
    const TestComponent = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState<CigaretteLicenseData>({
        ...emptyCigaretteLicenseData,
        mailingAddressLine1: "123 Test St",
        mailingAddressLine2: "Suite 100",
        mailingAddressCity: "Test City",
        mailingAddressState: { shortCode: "NJ", name: "New Jersey" },
        mailingAddressZipCode: "12345",
        mailingAddressIsTheSame: false,
        ...initialData,
      });

      return (
        <DataFormErrorMapContext.Provider
          value={{
            fieldStates: createDataFormErrorMap(),
            runValidations: false,
            reducer: () => {},
          }}
        >
          <CigaretteLicenseContext.Provider
            value={{
              state: cigaretteLicenseData,
              setCigaretteLicenseData,
            }}
          >
            <MailingAddress />
          </CigaretteLicenseContext.Provider>
        </DataFormErrorMapContext.Provider>
      );
    };

    render(<TestComponent />);
  };

  describe("Basic Rendering", () => {
    it("renders the mailing address form", () => {
      renderComponent();

      expect(screen.getByText("Mailing Address Line 1")).toBeInTheDocument();
      expect(screen.getByText("Mailing Address Line 2")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
      expect(screen.getByText("Zip Code")).toBeInTheDocument();
    });

    it("renders the same as business address checkbox", () => {
      renderComponent();

      expect(
        screen.getByText("Mailing address is the same as the business address"),
      ).toBeInTheDocument();
    });

    it("pre-populates fields with initial data", () => {
      renderComponent();

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Suite 100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
    });
  });

  describe("Checkbox Functionality", () => {
    it("toggles same as business address checkbox", async () => {
      renderComponent();

      const checkbox = screen.getByRole("checkbox", {
        name: "Mailing address is the same as the business address",
      });
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("hides address fields when checkbox is checked", () => {
      renderComponent({
        mailingAddressIsTheSame: true,
      });

      expect(screen.queryByDisplayValue("123 Test St")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("Suite 100")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("Test City")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("12345")).not.toBeInTheDocument();
    });

    it("shows address fields when checkbox is unchecked", () => {
      renderComponent({
        mailingAddressIsTheSame: false,
      });

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Suite 100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
    });
  });

  describe("State Dropdown", () => {
    it("renders state dropdown", () => {
      renderComponent();

      const stateDropdown = screen.getByTestId("mailingAddressState");
      expect(stateDropdown).toBeInTheDocument();
    });

    it("displays current state value", () => {
      renderComponent();

      const stateDropdown = screen.getByTestId("mailingAddressState");
      expect(stateDropdown).toHaveValue("NJ");
    });
  });

  describe("Form Interactions", () => {
    it("allows editing address line 1", async () => {
      renderComponent();

      const addressLine1Field = screen.getByDisplayValue("123 Test St");
      await userEvent.clear(addressLine1Field);
      await userEvent.type(addressLine1Field, "456 New St");
      await userEvent.tab();

      expect(addressLine1Field).toHaveValue("456 New St");
    });

    it("allows editing address line 2", async () => {
      renderComponent();
      const addressLine2Field = screen.getByDisplayValue("Suite 100");
      await userEvent.clear(addressLine2Field);
      await userEvent.type(addressLine2Field, "Suite 200");
      await userEvent.tab();

      expect(addressLine2Field).toHaveValue("Suite 200");
    });

    it("allows editing city field", async () => {
      renderComponent();

      const cityField = screen.getByDisplayValue("Test City");
      await userEvent.clear(cityField);
      await userEvent.type(cityField, "New City");
      await userEvent.tab();

      expect(cityField).toHaveValue("New City");
    });

    it("allows editing zip code field", async () => {
      renderComponent();

      const zipCodeField = screen.getByDisplayValue("12345");
      await userEvent.clear(zipCodeField);
      await userEvent.type(zipCodeField, "54321");
      await userEvent.tab();

      expect(zipCodeField).toHaveValue("54321");
    });
  });

  it("has proper labels for all fields", () => {
    renderComponent();

    expect(screen.getByLabelText("Mailing address line1")).toBeInTheDocument();
    expect(screen.getByLabelText("Mailing address line2")).toBeInTheDocument();
    expect(screen.getByLabelText("Mailing address city")).toBeInTheDocument();
    expect(screen.getByLabelText("Mailing address state")).toBeInTheDocument();
    expect(screen.getByLabelText("Mailing address zip code")).toBeInTheDocument();
  });

  it("has proper checkbox accessibility", () => {
    renderComponent();

    const checkbox = screen.getByRole("checkbox", {
      name: "Mailing address is the same as the business address",
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("id", "mailing-address-the-same");
  });
});
