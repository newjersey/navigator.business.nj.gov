/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getPageHelper } from "@/components/tasks/business-formation/contacts/testHelpers";
import { FormationPageHelpers, useSetupInitialMocks } from "@/test/helpers/helpers-formation";

import { generateMunicipality } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
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

describe("Formation - Registered Agent Fields", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  it("hides same-business-address checkbox for foreign legal structures", async () => {
    await getPageHelper({ businessPersona: "FOREIGN" }, { agentType: "MYSELF" });
    expect(
      screen.queryByLabelText(Config.formation.registeredAgent.sameAddressCheckbox),
    ).not.toBeInTheDocument();
  });

  it("defaults to myself and toggles between options with radio buttons", async () => {
    const page = await getPageHelper({}, { agentType: "MYSELF" });

    expect(screen.getByTestId("agent-myself")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-authorized-rep")).not.toBeInTheDocument();
    expect(screen.queryByTestId("agent-professional-service")).not.toBeInTheDocument();

    page.chooseRadio("registered-agent-authorized-rep");

    expect(screen.queryByTestId("agent-myself")).not.toBeInTheDocument();
    expect(screen.getByTestId("agent-authorized-rep")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-professional-service")).not.toBeInTheDocument();

    page.chooseRadio("registered-agent-professional-service");

    expect(screen.queryByTestId("agent-myself")).not.toBeInTheDocument();
    expect(screen.queryByTestId("agent-authorized-rep")).not.toBeInTheDocument();
    expect(screen.getByTestId("agent-professional-service")).toBeInTheDocument();

    page.chooseRadio("registered-agent-myself");

    expect(screen.getByTestId("agent-myself")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-authorized-rep")).not.toBeInTheDocument();
    expect(screen.queryByTestId("agent-professional-service")).not.toBeInTheDocument();
  });

  describe("email validation", () => {
    it("displays error message when @ is missing in email input field", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "MYSELF",
          agentEmail: "",
        },
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
          agentType: "MYSELF",
          agentEmail: "",
        },
      );

      page.fillText("Agent email", "deeb@");

      await attemptApiSubmission(page);
      expect(screen.getByText(Config.formation.fields.agentEmail.error)).toBeInTheDocument();
      expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
    });
  });

  it("auto-fills and disables agent address from business address when same address checkbox is checked for myself", async () => {
    const page = await getPageHelper(
      {},
      {
        agentType: "MYSELF",
        agentOfficeAddressLine1: "Old Add 123",
        agentOfficeAddressLine2: "Old Add 456",
        agentOfficeAddressCity: "Newark",
        agentOfficeAddressZipCode: "07001",
        addressLine1: "New Add 123",
        addressLine2: "New Add 456",
        addressMunicipality: generateMunicipality({
          name: "New Test City",
          displayName: "New Test City",
        }),
        addressZipCode: "07002",
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressCountry: "US",
        agentUseBusinessAddress: false,
      },
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

  it("un-disables but leaves values for agent address when user unchecks same address checkbox for myself", async () => {
    const page = await getPageHelper(
      {},
      {
        agentType: "MYSELF",
        addressLine1: "New Add 123",
        addressLine2: "New Add 456",
        addressMunicipality: generateMunicipality({
          name: "New Test City",
          displayName: "New Test City",
        }),
        addressZipCode: "07002",
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressCountry: "US",
        agentUseBusinessAddress: false,
      },
    );

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);
    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

    expect(
      page.getInputElementByLabel(Config.formation.registeredAgent.sameAddressCheckbox).checked,
    ).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address line1").value).toEqual("New Add 123");
    expect(page.getInputElementByLabel("Agent office address line2").value).toEqual("New Add 456");
    expect(page.getInputElementByLabel("Agent office address city").value).toEqual("New Test City");
    expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
    expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
    expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);
  });

  describe("Registered agent type: myself", () => {
    it("auto-fills saved formation form data when agent is myself", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "MYSELF",
          agentName: "agent 1",
          agentEmail: "agent@email.com",
          agentOfficeAddressLine1: "123 agent address",
          agentOfficeAddressLine2: "agent suite 201",
          agentOfficeAddressCity: "Newark",
          agentOfficeAddressZipCode: "99887",
        },
      );

      await waitFor(() => {
        expect(page.getInputElementByLabel("Agent name").value).toEqual("agent 1");
      });
      expect(page.getInputElementByLabel("Agent email").value).toEqual("agent@email.com");
      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual(
        "123 agent address",
      );
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual(
        "agent suite 201",
      );
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Newark");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("99887");
    });

    it("auto-fills agent name and email from user account when user info is present and Myself is selected, but does not lock the fields", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "MYSELF",
          agentEmail: "",
          agentName: "",
        },
        {
          name: "New Name",
          email: "new@example.com",
        },
      );
      page.chooseRadio("registered-agent-authorized-rep");
      page.chooseRadio("registered-agent-myself");
      expect(page.getInputElementByLabel("Agent name").value).toEqual("New Name");
      expect(page.getInputElementByLabel("Agent email").value).toEqual("new@example.com");
      expect(
        page.getInputElementByLabel("Agent name").readOnly ||
          page.getInputElementByLabel("Agent name").disabled,
      ).toEqual(false);
      expect(
        page.getInputElementByLabel("Agent email").readOnly ||
          page.getInputElementByLabel("Agent email").disabled,
      ).toEqual(false);
    });

    it("shows empty and editable agent name and email fields when user info is absent", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "MYSELF",
          agentEmail: undefined,
          agentName: undefined,
        },
        {
          name: undefined,
          email: undefined,
        },
      );

      expect(page.getInputElementByLabel("Agent name").value).toEqual("");
      expect(page.getInputElementByLabel("Agent email").value).toEqual("");
      expect(
        page.getInputElementByLabel("Agent name").readOnly ||
          page.getInputElementByLabel("Agent name").disabled,
      ).toBeFalsy();
      expect(
        page.getInputElementByLabel("Agent email").readOnly ||
          page.getInputElementByLabel("Agent email").disabled,
      ).toBeFalsy();
    });

    describe("required fields", () => {
      it("agent name", async () => {
        const page = await getPageHelper(
          {},
          {
            agentName: "",
            agentType: "MYSELF",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentName.label,
        );
      });

      it("agent email", async () => {
        const page = await getPageHelper(
          {},
          {
            agentEmail: "",
            agentType: "MYSELF",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentEmail.label,
        );
      });

      it("agent address line 1", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressLine1: "",
            agentType: "MYSELF",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressLine1.label,
        );
      });

      it("Agent office address city", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressCity: "",
            agentType: "MYSELF",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressCity.label,
        );
      });

      it("Agent office address zip code", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressZipCode: "",
            agentType: "MYSELF",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressZipCode.label,
        );
      });
    });
  });

  describe("Registered agent type: authorized rep", () => {
    it("auto-fills saved formation form data when agent is authorized rep", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "AUTHORIZED_REP",
          agentName: "agent 1",
          agentEmail: "agent@email.com",
          agentOfficeAddressLine1: "123 agent address",
          agentOfficeAddressLine2: "agent suite 201",
          agentOfficeAddressCity: "Newark",
          agentOfficeAddressZipCode: "99887",
        },
      );

      await waitFor(() => {
        expect(page.getInputElementByLabel("Agent name").value).toEqual("agent 1");
      });
      expect(page.getInputElementByLabel("Agent email").value).toEqual("agent@email.com");
      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual(
        "123 agent address",
      );
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual(
        "agent suite 201",
      );
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Newark");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("99887");
    });

    it("auto-fills and disables agent address from business address when same address checkbox is checked for authorized rep", async () => {
      const page = await getPageHelper(
        {},
        {
          agentType: "AUTHORIZED_REP",
          agentOfficeAddressLine1: "Old Add 123",
          agentOfficeAddressLine2: "Old Add 456",
          agentOfficeAddressCity: "Newark",
          agentOfficeAddressZipCode: "07001",
          addressLine1: "New Add 123",
          addressLine2: "New Add 456",
          addressMunicipality: generateMunicipality({
            name: "New Test City",
            displayName: "New Test City",
          }),
          addressZipCode: "07002",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressCountry: "US",
          agentUseBusinessAddress: false,
        },
      );

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual(
        "Old Add 123",
      );
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual(
        "Old Add 456",
      );
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual("Newark");
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07001");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(false);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(false);

      page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

      expect(page.getInputElementByLabel("Agent office address line1").value).toEqual(
        "New Add 123",
      );
      expect(page.getInputElementByLabel("Agent office address line2").value).toEqual(
        "New Add 456",
      );
      expect(page.getInputElementByLabel("Agent office address city").value).toEqual(
        "New Test City",
      );
      expect(page.getInputElementByLabel("Agent office address zip code").value).toEqual("07002");
      expect(page.getInputElementByLabel("Agent office address line1").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address line2").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address city").disabled).toEqual(true);
      expect(page.getInputElementByLabel("Agent office address zip code").disabled).toEqual(true);
    });

    describe("required fields", () => {
      it("agent name", async () => {
        const page = await getPageHelper(
          {},
          {
            agentName: "",
            agentType: "AUTHORIZED_REP",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentName.label,
        );
      });

      it("agent email", async () => {
        const page = await getPageHelper(
          {},
          {
            agentEmail: "",
            agentType: "AUTHORIZED_REP",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentEmail.label,
        );
      });

      it("agent address line 1", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressLine1: "",
            agentType: "AUTHORIZED_REP",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressLine1.label,
        );
      });

      it("Agent office address city", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressCity: "",
            agentType: "AUTHORIZED_REP",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressCity.label,
        );
      });

      it("Agent office address zip code", async () => {
        const page = await getPageHelper(
          {},
          {
            agentOfficeAddressZipCode: "",
            agentType: "AUTHORIZED_REP",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentOfficeAddressZipCode.label,
        );
      });
    });
  });

  describe("Registered agent type: professional service", () => {
    it("auto-fills formation form data when professional service is selected", async () => {
      const page = await getPageHelper(
        {},
        {
          agentNumber: "123465798",
          agentType: "PROFESSIONAL_SERVICE",
        },
      );
      expect(page.getInputElementByLabel("Agent number").value).toBe("123465798");
    });

    describe("required fields", () => {
      it("agent number", async () => {
        const page = await getPageHelper(
          {},
          {
            agentNumber: "",
            agentType: "PROFESSIONAL_SERVICE",
          },
        );
        await attemptApiSubmission(page);
        expect(screen.getByRole("alert")).toHaveTextContent(
          Config.formation.fields.agentNumber.label,
        );
      });
    });
  });

  it("shows inline validation for missing fields with checkbox", async () => {
    const page = await getPageHelper(
      { municipality: generateMunicipality({ name: "New Test City" }) },
      {
        agentType: "MYSELF",
        agentOfficeAddressLine1: "",
        addressLine1: "",
        agentUseAccountInfo: false,
      },
    );

    page.fillText("Agent office address line1", "test");
    page.fillText("Agent office address line1", "");

    page.selectCheckbox(Config.formation.registeredAgent.sameAddressCheckbox);

    expect(
      await waitFor(() => screen.findByText(Config.formation.fields.agentOfficeAddressLine1.error)),
    ).toBeInTheDocument();
  });

  it("displays error message due to non-NJ zipcode is entered in registered agent address", async () => {
    const page = await getPageHelper(
      {},
      {
        agentOfficeAddressZipCode: "",
        agentType: "MYSELF",
      },
    );

    page.fillText("Agent office address zip code", "22222");

    await attemptApiSubmission(page);
    expect(
      screen.getByText(Config.formation.fields.agentOfficeAddressZipCode.error),
    ).toBeInTheDocument();
    expect(screen.getByText(Config.formation.errorBanner.errorOnStep)).toBeInTheDocument();
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToContactsStep();
  };
});
