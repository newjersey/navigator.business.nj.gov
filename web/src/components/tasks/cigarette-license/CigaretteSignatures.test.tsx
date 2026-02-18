import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  DataFormErrorMapContext,
  createDataFormErrorMap,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { fillTextUserEvent } from "@/test/helpers/helpers-testing-library-selectors";
import { generateCigaretteLicenseData } from "@businessnjgovnavigator/shared";
import { ConfigContext, getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";
import { ReactNode, useState } from "react";
import { CigaretteSignatures } from "./CigaretteSignatures";

const Config = getMergedConfig();

const renderComponent = (cigaretteLicenseData = generateCigaretteLicenseData({})): void => {
  const TestComponent = (): ReactNode => {
    const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
    const [localCigaretteLicenseData, setLocalCigaretteLicenseData] =
      useState(cigaretteLicenseData);

    return (
      <ConfigContext.Provider value={{ config: Config, setOverrides: jest.fn() }}>
        <DataFormErrorMapContext.Provider value={formContextState}>
          <CigaretteLicenseContext.Provider
            value={{
              state: localCigaretteLicenseData,
              setCigaretteLicenseData: setLocalCigaretteLicenseData,
              saveCigaretteLicenseData: jest.fn(),
            }}
          >
            <CigaretteSignatures />
          </CigaretteLicenseContext.Provider>
        </DataFormErrorMapContext.Provider>
      </ConfigContext.Provider>
    );
  };

  render(<TestComponent />);
};

describe("<CigaretteSignatures />", () => {
  it("renders the signers header", () => {
    renderComponent();
    expect(screen.getByText(Config.cigaretteLicenseStep4.signersHeader)).toBeInTheDocument();
  });

  it("renders the signers description", () => {
    renderComponent();
    expect(screen.getByText(Config.cigaretteLicenseStep4.signersDescription)).toBeInTheDocument();
  });

  it("renders the signer name field", () => {
    renderComponent();
    expect(screen.getByRole("textbox", { name: "Signer name" })).toBeInTheDocument();
  });

  it("renders the signer relationship field", () => {
    renderComponent();
    expect(screen.getByRole("textbox", { name: "Signer relationship" })).toBeInTheDocument();
  });

  it("renders the signer signature checkbox", () => {
    renderComponent();
    expect(
      screen.getByRole("checkbox", { name: Config.cigaretteLicenseStep4.signLabel }),
    ).toBeInTheDocument();
  });

  describe("Field Validation", () => {
    it("shows validation error for empty signer name on blur", async () => {
      renderComponent();

      await fillTextUserEvent("Signer name", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep4.signerNameErrorText),
      ).toBeInTheDocument();
    });

    it("shows validation error for empty signer relationship on blur", async () => {
      renderComponent();

      await fillTextUserEvent("Signer relationship", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep4.signerRelationshipErrorText),
      ).toBeInTheDocument();
    });

    it("clears validation error when signer name is filled", async () => {
      renderComponent();

      await fillTextUserEvent("Signer name", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep4.signerNameErrorText),
      ).toBeInTheDocument();

      await fillTextUserEvent("Signer name", "Test Person");

      expect(
        screen.queryByText(Config.cigaretteLicenseStep4.signerNameErrorText),
      ).not.toBeInTheDocument();
    });

    it("clears validation error when signer relationship is filled", async () => {
      renderComponent();

      await fillTextUserEvent("Signer relationship", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep4.signerRelationshipErrorText),
      ).toBeInTheDocument();

      await fillTextUserEvent("Signer relationship", "Owner");

      expect(
        screen.queryByText(Config.cigaretteLicenseStep4.signerRelationshipErrorText),
      ).not.toBeInTheDocument();
    });
  });

  describe("Initial State", () => {
    it("initializes with empty signer name when no data provided", () => {
      renderComponent(generateCigaretteLicenseData({ signerName: undefined }));
      const signerNameField = screen.getByRole("textbox", { name: "Signer name" });
      expect(signerNameField).toHaveValue("");
    });

    it("initializes with empty signer relationship when no data provided", () => {
      renderComponent(generateCigaretteLicenseData({ signerRelationship: undefined }));
      const signerRelationshipField = screen.getByRole("textbox", { name: "Signer relationship" });
      expect(signerRelationshipField).toHaveValue("");
    });

    it("initializes with unchecked signature when no data provided", () => {
      renderComponent(generateCigaretteLicenseData({ signature: undefined }));
      const signatureCheckbox = screen.getByRole("checkbox", {
        name: Config.cigaretteLicenseStep4.signLabel,
      });
      expect(signatureCheckbox).not.toBeChecked();
    });

    it("initializes with provided signer name data", () => {
      renderComponent(generateCigaretteLicenseData({ signerName: "Test Person" }));
      const signerNameField = screen.getByRole("textbox", { name: "Signer name" });
      expect(signerNameField).toHaveValue("Test Person");
    });

    it("initializes with provided signer relationship data", () => {
      renderComponent(generateCigaretteLicenseData({ signerRelationship: "Owner" }));
      const signerRelationshipField = screen.getByRole("textbox", { name: "Signer relationship" });
      expect(signerRelationshipField).toHaveValue("Owner");
    });

    it("initializes with provided signature data", () => {
      renderComponent(generateCigaretteLicenseData({ signature: true }));
      const signatureCheckbox = screen.getByRole("checkbox", {
        name: Config.cigaretteLicenseStep4.signLabel,
      });
      expect(signatureCheckbox).toBeChecked();
    });
  });
});
