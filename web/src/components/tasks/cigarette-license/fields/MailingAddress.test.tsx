import { MailingAddress } from "@/components/tasks/cigarette-license/fields/MailingAddress";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { fillTextUserEvent } from "@/test/helpers/helpers-testing-library-selectors";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness } from "@businessnjgovnavigator/shared/test/factories";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode, useState } from "react";

const Config = getMergedConfig();

describe("<MailingAddress />", () => {
  const renderComponent = (initialData?: Partial<CigaretteLicenseData>): void => {
    const TestComponent = (): ReactNode => {
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
      const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

      return (
        <DataFormErrorMapContext.Provider value={formContextState}>
          <CigaretteLicenseContext.Provider
            value={{
              state: cigaretteLicenseData,
              setCigaretteLicenseData,
              saveCigaretteLicenseData: jest.fn(),
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

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressLine1.label),
      ).toBeInTheDocument();
      expect(screen.getByText("Mailing Address Line 2")).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressCity.label),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressState.label),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressZipCode.label),
      ).toBeInTheDocument();
    });

    it("renders the same as business address checkbox", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.mailingIsSameCheckbox),
      ).toBeInTheDocument();
    });

    it("pre-populates fields with initial data", () => {
      renderComponent();

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Suite 100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("NJ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
    });
  });

  describe("Checkbox Functionality", () => {
    it("toggles same as business address checkbox", async () => {
      renderComponent();

      const checkbox = screen.getByRole("checkbox", {
        name: Config.cigaretteLicenseStep2.mailingIsSameCheckbox,
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
      expect(screen.queryByDisplayValue("NJ")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("12345")).not.toBeInTheDocument();
    });

    it("shows address fields when checkbox is unchecked", () => {
      renderComponent({
        mailingAddressIsTheSame: false,
      });

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Suite 100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("NJ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
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

  describe("Field Validation", () => {
    it("renders error onBlur when mailing address line 1 is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Mailing address line1", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressLine1.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when mailing address line 2 is invalid", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent(
        "Mailing address line2",
        "This address line 2 content has more than 35 characters and therefore it is invalid and should be rejected",
      );

      expect(
        screen.getByText(
          Config.cigaretteLicenseStep2.fields.mailingAddressLine2.errorValidationText,
        ),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when mailing address city is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Mailing address city", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.mailingAddressCity.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when mailing address zip code is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Mailing address zip code", "");

      expect(
        screen.getByText(
          Config.cigaretteLicenseStep2.fields.mailingAddressZipCode.errorRequiredText,
        ),
      ).toBeInTheDocument();
    });

    //TODO: Add tests for invalid zip code and missing state - these aren't working right now as expected
  });
});
