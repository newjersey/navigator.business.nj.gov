/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";

import { getMergedConfig } from "@/contexts/configContext";
import { generateMunicipality } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - Registered Agent Field", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  it("auto-fills fields when agent number is selected", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumber: "123465798",
        agentNumberOrManual: "NUMBER",
      }
    );
    expect(page.getInputElementByLabel("Agent number").value).toBe("123465798");
  });

  it("auto-fills fields when agent is manual entry", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentName: "agent 1",
        agentEmail: "agent@email.com",
        agentOfficeAddressLine1: "123 agent address",
        agentOfficeAddressLine2: "agent suite 201",
        agentOfficeAddressCity: "Newark",
        agentOfficeAddressZipCode: "99887",
      }
    );

    await waitFor(() => {
      expect(page.getInputElementByLabel("Agent name").value).toEqual("agent 1");
    });
    expect(page.getInputElementByLabel("Agent email").value).toEqual("agent@email.com");
    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("123 agent address");
    expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("agent suite 201");
    expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Newark");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("99887");
  });

  it("hides same-business-address checkbox for foreign legal structures", async () => {
    await getPageHelper({ businessPersona: "FOREIGN" }, { agentNumberOrManual: "MANUAL_ENTRY" });
    expect(
      screen.queryByLabelText(Config.formation.registeredAgent.sameAddressCheckbox)
    ).not.toBeInTheDocument();
  });

  it("defaults to registered agent number and toggles to manual with radio button", async () => {
    const page = await getPageHelper({}, { agentNumberOrManual: "NUMBER" });

    expect(screen.getByTestId("agent-number")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-name")).not.toBeInTheDocument();

    page.chooseRadio("registered-agent-manual");

    expect(screen.queryByTestId("agent-number")).not.toBeInTheDocument();
    expect(screen.getByTestId("agent-name")).toBeInTheDocument();

    page.chooseRadio("registered-agent-number");

    expect(screen.getByTestId("agent-number")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-name")).not.toBeInTheDocument();
  });

  it("auto-fills and disables agent name and email from user account when box checked", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentEmail: "original@example.com",
        agentName: "Original Name",
        agentUseAccountInfo: false,
      },
      {
        name: "New Name",
        email: "new@example.com",
      }
    );

    expect(page.getInputElementByLabel("Agent name").value).toEqual("Original Name");
    expect(page.getInputElementByLabel("Agent email").value).toEqual("original@example.com");
    expect(page.getInputElementByLabel("Agent name").readOnly).toEqual(false);
    expect(page.getInputElementByLabel("Agent email").readOnly).toEqual(false);

    page.selectCheckbox(Config.formation.registeredAgent.sameContactCheckbox);

    expect(page.getInputElementByLabel("Agent name").value).toEqual("New Name");
    expect(page.getInputElementByLabel("Agent email").value).toEqual("new@example.com");
    expect(page.getInputElementByLabel("Agent name").readOnly).toEqual(true);
    expect(page.getInputElementByLabel("Agent email").readOnly).toEqual(true);
  });

  it("un-disables but leaves values for agent name and email when user unchecks", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentEmail: "original@example.com",
        agentName: "Original Name",
        agentUseAccountInfo: false,
      },
      {
        name: "New Name",
        email: "new@example.com",
      }
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameContactCheckbox);
    page.selectCheckbox(Config.formation.registeredAgent.sameContactCheckbox);

    expect(page.getInputElementByLabel("Agent name").value).toEqual("New Name");
    expect(page.getInputElementByLabel("Agent email").value).toEqual("new@example.com");
    expect(page.getInputElementByLabel("Agent name").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent email").disabled).toEqual(false);
  });

  it("auto-fills and disables agent address from Address when box checked", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentOfficeAddressLine1: "Old Add 123",
        agentOfficeAddressLine2: "Old Add 456",
        agentOfficeAddressCity: "Newark",

        agentOfficeAddressZipCode: "07001",
        addressLine1: "New Add 123",
        addressLine2: "New Add 456",
        addressMunicipality: generateMunicipality({ name: "New Test City", displayName: "New Test City" }),
        addressZipCode: "07002",
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressCountry: "US",
        agentUseAccountInfo: false,
      }
    );

    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("Old Add 123");
    expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("Old Add 456");
    expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Newark");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07001");
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
    expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
    expect(page.getInputElementByLabel("Agent office address city").value).toEqual("New Test City");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(true);
  });

  it("fills & disables only fields with values when some fields missing", async () => {
    const page = await getPageHelper(
      { municipality: generateMunicipality({ name: "New Test City" }) },
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentOfficeAddressLine1: "",
        agentOfficeAddressZipCode: "",
        addressLine1: "New Add 123",
        addressZipCode: "",
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressCountry: "US",
        agentUseAccountInfo: false,
      }
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("");
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(true);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
  });

  it("shows inline validation for missing fields with checkbox", async () => {
    const page = await getPageHelper(
      { municipality: generateMunicipality({ name: "New Test City" }) },
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentOfficeAddressLine1: "",
        addressLine1: "",
        agentUseAccountInfo: false,
      }
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);
    expect(screen.getByText(Config.formation.fields.agentOfficeAddressLine1.error)).toBeInTheDocument();
  });

  it("unselects checkbox when user interacts with non-disabled field", async () => {
    const page = await getPageHelper(
      { municipality: generateMunicipality({ name: "New Test City" }) },
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        agentOfficeAddressZipCode: "",
        addressZipCode: "",
        agentUseAccountInfo: false,
      }
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);
    expect(page.getInputElementByLabel(Config.formation.registeredAgent.sameAddressCheckbox).checked).toEqual(
      true
    );
    page.fillText("Agent office address zip code", "12345");
    expect(page.getInputElementByLabel(Config.formation.registeredAgent.sameAddressCheckbox).checked).toEqual(
      false
    );
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
  });

  it("un-disables fields but leaves values when user unchecks same Address box", async () => {
    const page = await getPageHelper(
      {},
      {
        agentNumberOrManual: "MANUAL_ENTRY",
        addressLine1: "New Add 123",
        addressLine2: "New Add 456",
        addressMunicipality: generateMunicipality({ name: "New Test City", displayName: "New Test City" }),
        addressZipCode: "07002",
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressCountry: "US",
        agentUseBusinessAddress: false,
      }
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);
    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

    expect(page.getInputElementByLabel(Config.formation.registeredAgent.sameAddressCheckbox).checked).toEqual(
      false
    );
    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
    expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
    expect(page.getInputElementByLabel("Agent office address city").value).toEqual("New Test City");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
  });

  it("displays error message due to non-NJ zipcode is entered in registered agent address", async () => {
    const page = await getPageHelper(
      {},
      {
        agentOfficeAddressZipCode: "",
        agentNumberOrManual: "MANUAL_ENTRY",
      }
    );

    page.fillText("Agent office address zip code", "22222");

    await attemptApiSubmission(page);
    expect(screen.getByText(Config.formation.fields.agentOfficeAddressZipCode.error)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
  });

  describe("email validation", () => {
    it("displays error message when @ is missing in email input field", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentEmail: "",
        }
      );

      page.fillText("Agent email", "deeb.gmail");

      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.fields.agentEmail.error)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
    });

    it("displays error message when email domain is missing in email input field", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentEmail: "",
        }
      );

      page.fillText("Agent email", "deeb@");

      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.fields.agentEmail.error)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
    });

    it("passes email validation", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumberOrManual: "MANUAL_ENTRY",
          agentEmail: "",
        }
      );

      page.fillText("Agent email", "lol@deeb.gmail");
      await attemptApiSubmission(page);
      expect(screen.queryByText(Config.formation.fields.agentEmail.error)).not.toBeInTheDocument();
    });
  });

  describe("required fields - when agent number selected", () => {
    it("agent number", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumber: "",
          agentNumberOrManual: "NUMBER",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.agentNumber.label);
    });
  });

  describe("required fields - when agent manual selected", () => {
    it("agent name", async () => {
      const page = await getPageHelper(
        {},
        {
          agentName: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.agentName.label);
    });

    it("agent email", async () => {
      const page = await getPageHelper(
        {},
        {
          agentEmail: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.agentEmail.label);
    });

    it("agent address line 1", async () => {
      const page = await getPageHelper(
        {},
        {
          agentOfficeAddressLine1: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.agentOfficeAddressLine1.label
      );
    });

    it("Agent office address city", async () => {
      const page = await getPageHelper(
        {},
        {
          agentOfficeAddressCity: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.agentOfficeAddressCity.label
      );
    });

    it("Agent office address zip code", async () => {
      const page = await getPageHelper(
        {},
        {
          agentOfficeAddressZipCode: "",
          agentNumberOrManual: "MANUAL_ENTRY",
        }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.agentOfficeAddressZipCode.label
      );
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
