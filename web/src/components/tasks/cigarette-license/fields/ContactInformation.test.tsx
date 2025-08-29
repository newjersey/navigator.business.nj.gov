import { ContactInformation } from "@/components/tasks/cigarette-license/fields/ContactInformation";
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
import { useState } from "react";

const Config = getMergedConfig();

describe("<ContactInformation />", () => {
  const renderComponent = (initialData?: Partial<CigaretteLicenseData>): void => {
    const TestComponent = (): JSX.Element => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState<CigaretteLicenseData>({
        ...emptyCigaretteLicenseData,
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
            <ContactInformation />
          </CigaretteLicenseContext.Provider>
        </DataFormErrorMapContext.Provider>
      );
    };

    render(<TestComponent />);
  };

  describe("Basic Rendering", () => {
    it("renders the contact information form", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.label),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactPhoneNumber.label),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.label),
      ).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("allows editing contact name field", async () => {
      renderComponent();
      const contactNameField = screen.getByLabelText("Contact name");

      await fillTextUserEvent("Contact name", "Second Person");

      expect(contactNameField).toHaveValue("Second Person");
    });

    it("allows editing contact phone number field and formats it correctly", async () => {
      renderComponent();
      const contactPhoneNumberField = screen.getByLabelText("Contact phone number");

      await fillTextUserEvent("Contact phone number", "5551234567");

      expect(contactPhoneNumberField).toHaveValue("(555) 123-4567");
    });

    it("allows editing contact email field", async () => {
      renderComponent();
      const contactEmailField = screen.getByLabelText("Contact email");

      await fillTextUserEvent("Contact email", "test.person@example.com");

      expect(contactEmailField).toHaveValue("test.person@example.com");
    });
  });

  describe("Field Validation", () => {
    it("renders error onBlur when contact name is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Contact name", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when contact phone number is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Contact phone number", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactPhoneNumber.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when contact phone number is invalid", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Contact phone number", "123");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactPhoneNumber.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when contact email is empty", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Contact email", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.errorRequiredText),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when contact email is invalid", async () => {
      await renderComponent(generateBusiness({}));

      await fillTextUserEvent("Contact email", "invalid-email");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.errorRequiredText),
      ).toBeInTheDocument();
    });
  });
});
