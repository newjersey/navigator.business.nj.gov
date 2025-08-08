import { MailingAddress } from "@/components/tasks/cigarette-license/fields/MailingAddress";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { getMergedConfig } from "@/contexts/configContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useConfig", () => ({ useConfig: jest.fn() }));

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());

const mockUseConfig = jest.requireMock("@/lib/data-hooks/useConfig").useConfig;

describe("<MailingAddress />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseConfig.mockReturnValue({ Config });
    (useMediaQuery as jest.Mock).mockImplementation(() => false); // Default to desktop
  });

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
    it("toggles same as business address checkbox", () => {
      renderComponent();

      const checkbox = screen.getByRole("checkbox", {
        name: "Mailing address is the same as the business address",
      });
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

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
    it("allows editing address line 1", () => {
      renderComponent();

      const addressLine1Field = screen.getByDisplayValue("123 Test St");
      fireEvent.change(addressLine1Field, { target: { value: "456 New St" } });

      expect(addressLine1Field).toHaveValue("456 New St");
    });

    it("allows editing city field", () => {
      renderComponent();

      const cityField = screen.getByDisplayValue("Test City");
      fireEvent.change(cityField, { target: { value: "New City" } });

      expect(cityField).toHaveValue("New City");
    });

    it("allows editing zip code field", () => {
      renderComponent();

      const zipCodeField = screen.getByDisplayValue("12345");
      fireEvent.change(zipCodeField, { target: { value: "54321" } });

      expect(zipCodeField).toHaveValue("54321");
    });
  });

  describe("Responsive Behavior", () => {
    it("renders correctly on mobile", () => {
      jest.requireMock("@mui/material").useMediaQuery.mockReturnValue(true);

      renderComponent();

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
    });

    it("renders correctly on desktop", () => {
      jest.requireMock("@mui/material").useMediaQuery.mockReturnValue(false);

      renderComponent();

      expect(screen.getByDisplayValue("123 Test St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test City")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
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
});
