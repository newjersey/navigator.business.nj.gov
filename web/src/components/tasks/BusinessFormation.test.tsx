import { BusinessFormation } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateFormationData,
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  generateTask,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  FormationFormData,
  FormationSubmitResponse,
  GetFilingResponse,
  LookupLegalStructureById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { act, fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

function flushPromises() {
  return new Promise((resolve) => process.nextTick(resolve));
}

describe("<BusinessFormation />", () => {
  let subject: RenderResult;
  const task = generateTask({});

  const renderTask = (userData: Partial<UserData>): RenderResult => {
    const displayContent = generateFormationDisplayContent({
      businessNameAndLegalStructure: {
        contentMd: "business name and legal structure",
      },
      optInAnnualReport: { contentMd: "Annual report" },
      optInCorpWatch: { contentMd: "Corp watch" },
      officialFormationDocument: {
        contentMd: "Official formation document",
        cost: "$125.00",
      },
      certificateOfStanding: {
        contentMd: "Certificate of standing",
        cost: "$50.00",
        optionalLabel: "",
      },
      certifiedCopyOfFormationDocument: {
        contentMd: "Certified copy of formation document",
        cost: "$25.00",
        optionalLabel: "",
      },
    });

    return render(
      <WithStatefulUserData initialUserData={generateUserData(userData)}>
        <ThemeProvider theme={createTheme()}>
          <BusinessFormation task={task} displayContent={displayContent} />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  const mockApiResponse = (response?: FormationSubmitResponse) => {
    mockApi.postBusinessFormation.mockImplementation((userData) => {
      return Promise.resolve({
        ...userData,
        formationData: {
          ...userData.formationData,
          formationResponse: response,
        },
      });
    });
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
    mockApiResponse();
  });

  it("does not show form for non-LLC legal structure", () => {
    const profileData = generateProfileData({ legalStructureId: "limited-liability-partnership" });
    subject = renderTask({ profileData });
    expect(subject.queryByTestId("formation-form")).not.toBeInTheDocument();
  });

  it("shows form only for LLC legal structure", () => {
    const profileData = generateProfileData({ legalStructureId: "limited-liability-company" });
    subject = renderTask({ profileData });
    expect(subject.queryByTestId("formation-form")).toBeInTheDocument();
    expect(subject.getByText("business name and legal structure")).toBeInTheDocument();
    expect(subject.queryByTestId("business-section")).toBeInTheDocument();
  });

  describe("when LLC", () => {
    it("requests for getFiling and updates userData when at ?completeFiling=true query param and replaces URL", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
      });
      useMockRouter({ isReady: true, query: { completeFiling: "true" } });
      const newUserData = generateUserData({});
      mockApi.getCompletedFiling.mockResolvedValue(newUserData);

      subject = renderTask({ profileData, formationData });
      expect(mockApi.getCompletedFiling).toHaveBeenCalled();
      await waitFor(() => expect(currentUserData()).toEqual(newUserData));
      expect(mockPush).toHaveBeenCalledWith({ pathname: "/tasks/form-business-entity" }, undefined, {
        shallow: true,
      });
    });

    describe("success page", () => {
      let getFilingResponse: GetFilingResponse;
      beforeEach(() => {
        getFilingResponse = generateGetFilingResponse({ success: true });
        const profileData = generateLLCProfileData({});
        const formationData = generateFormationData({ getFilingResponse });
        subject = renderTask({ profileData, formationData });
      });

      it("displays success page, documents, entity id, confirmation id", () => {
        expect(subject.getByText(BusinessFormationDefaults.successPageHeader)).toBeInTheDocument();
        expect(subject.getByText(BusinessFormationDefaults.successPageSubheader)).toBeInTheDocument();
        expect(subject.getByText(getFilingResponse.entityId)).toBeInTheDocument();
        expect(subject.getByText(getFilingResponse.confirmationNumber)).toBeInTheDocument();
        expect(subject.getByTestId(BusinessFormationDefaults.formationDocLabel).getAttribute("href")).toEqual(
          getFilingResponse.formationDoc
        );
        expect(subject.getByTestId(BusinessFormationDefaults.standingDocLabel).getAttribute("href")).toEqual(
          getFilingResponse.standingDoc
        );
        expect(subject.getByTestId(BusinessFormationDefaults.certifiedDocLabel).getAttribute("href")).toEqual(
          getFilingResponse.certifiedDoc
        );
      });

      it("shows expiration date as transaction date plus 30 days", () => {
        const datePlusThirty = dayjs(getFilingResponse.transactionDate).add(30, "days").format("MM/DD/YYYY");
        const bodyText = templateEval(BusinessFormationDefaults.successPageBody, {
          expirationDate: datePlusThirty,
        });
        expect(subject.getByText(bodyText)).toBeInTheDocument();
      });
    });

    it("fills multi-tab form, submits, and updates userData", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = {
        formationFormData: createEmptyFormationFormData(),
        formationResponse: undefined,
        getFilingResponse: undefined,
      };
      subject = renderTask({ profileData, formationData });

      selectByText("Business suffix", "LLC");
      const threeDaysFromNow = dayjs().add(3, "days");
      if (threeDaysFromNow.month() !== dayjs().month()) {
        selectNextMonth();
      }
      selectDate(threeDaysFromNow);
      fillText("Business address line1", "1234 main street");
      fillText("Business address line2", "Suite 304");
      fillText("Business address zip code", "08001");

      chooseRadio("registered-agent-manual");
      fillText("Agent name", "Hugo Weaving");
      fillText("Agent email", "name@example.com");
      fillText("Agent office address line1", "400 Pennsylvania Ave");
      fillText("Agent office address line2", "Suite 101");
      fillText("Agent office address city", "Newark");
      fillText("Agent office address zip code", "08002");

      await submitBusinessTab();

      fillText("Signer", "Elrond");

      await submitContactsTab();

      fillText("Contact first name", "John");
      fillText("Contact last name", "Smith");
      fillText("Contact phone number", "123A45a678 90");

      selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
      selectCheckBox("Annual report");
      selectCheckBox("Corp watch");
      selectCheckBox("Certificate of standing");
      selectCheckBox("Certified copy of formation document");

      await clickSubmit();

      await waitFor(() => {
        const formationFormData = currentUserData().formationData.formationFormData;
        expect(formationFormData.businessSuffix).toEqual("LLC");
        expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format("YYYY-MM-DD"));
        expect(formationFormData.businessAddressLine1).toEqual("1234 main street");
        expect(formationFormData.businessAddressLine2).toEqual("Suite 304");
        expect(formationFormData.businessAddressState).toEqual("NJ");
        expect(formationFormData.businessAddressZipCode).toEqual("08001");
        expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
        expect(formationFormData.agentNumber).toEqual("");
        expect(formationFormData.agentName).toEqual("Hugo Weaving");
        expect(formationFormData.agentEmail).toEqual("name@example.com");
        expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
        expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
        expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
        expect(formationFormData.agentOfficeAddressState).toEqual("NJ");
        expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
        expect(formationFormData.signer).toEqual("Elrond");
        expect(formationFormData.additionalSigners).toEqual([]);
        expect(formationFormData.contactFirstName).toEqual("John");
        expect(formationFormData.contactLastName).toEqual("Smith");
        expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
        expect(formationFormData.paymentType).toEqual("CC");
        expect(formationFormData.officialFormationDocument).toEqual(true);
        expect(formationFormData.certificateOfStanding).toEqual(true);
        expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
        expect(subject.getByText("$200.00")).toBeInTheDocument();
        expect(formationFormData.annualReportNotification).toEqual(true);
        expect(formationFormData.corpWatchNotification).toEqual(true);
      });
    });

    it("auto-fills fields from userData if it exists and agent number is selected", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = {
        formationFormData: generateFormationFormData({
          businessSuffix: "LTD LIABILITY CO",
          businessStartDate: dayjs().format("YYYY-MM-DD"),
          businessAddressLine1: `123 main street`,
          businessAddressLine2: `suite 102`,
          businessAddressState: "NJ",
          businessAddressZipCode: `07601`,
          agentNumber: `123465798`,
          signer: `signer 1`,
          additionalSigners: [`signer 2`, "signer 3"],
          paymentType: "CC",
          contactFirstName: `John`,
          contactLastName: `Smith`,
          contactPhoneNumber: `6024153214`,
          annualReportNotification: true,
          corpWatchNotification: true,
          officialFormationDocument: true,
          certificateOfStanding: true,
          certifiedCopyOfFormationDocument: true,
        }),
        formationResponse: undefined,
        getFilingResponse: undefined,
      };

      subject = renderTask({ profileData, formationData });
      chooseRadio("registered-agent-number");

      expect(subject.getByText("LTD LIABILITY CO")).toBeInTheDocument();
      expect(getInputElementByLabel("Business start date").value).toBe(dayjs().format("MM/DD/YYYY"));
      expect(getInputElementByLabel("Business address line1").value).toBe("123 main street");
      expect(getInputElementByLabel("Business address line2").value).toBe("suite 102");
      expect(getInputElementByLabel("Business address state").value).toBe("NJ");
      expect(getInputElementByLabel("Business address zip code").value).toBe("07601");
      expect(getInputElementByLabel("Agent number").value).toBe("123465798");

      await submitBusinessTab();

      expect(getInputElementByLabel("Signer").value).toBe("signer 1");
      expect(getInputElementByLabel("Additional signer 0").value).toBe("signer 2");
      expect(getInputElementByLabel("Additional signer 1").value).toBe("signer 3");

      await submitContactsTab();

      expect(subject.getByText(BusinessFormationDefaults.creditCardPaymentTypeLabel)).toBeInTheDocument();
      expect(getInputElementByLabel("Contact first name").value).toBe("John");
      expect(getInputElementByLabel("Contact last name").value).toBe("Smith");
      expect(getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
      expect(getInputElementByLabel("Annual report").checked).toBe(true);
      expect(getInputElementByLabel("Corp watch").checked).toBe(true);
      expect(getInputElementByLabel("Official formation document").checked).toBe(true);
      expect(getInputElementByLabel("Certificate of standing").checked).toBe(true);
      expect(getInputElementByLabel("Certified copy of formation document").checked).toBe(true);
    });

    it("auto-fills fields from userData if it exists with agent manual entry", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = {
        formationFormData: generateFormationFormData({
          agentNumberOrManual: "MANUAL_ENTRY",
          agentName: `agent 1`,
          agentEmail: `agent@email.com`,
          agentOfficeAddressLine1: `123 agent address`,
          agentOfficeAddressLine2: `agent suite 201`,
          agentOfficeAddressCity: `agent-city-402`,
          agentOfficeAddressState: "DC",
          agentOfficeAddressZipCode: `998877`,
        }),
        formationResponse: undefined,
        getFilingResponse: undefined,
      };

      subject = renderTask({ profileData, formationData });
      chooseRadio("registered-agent-manual");

      await waitFor(() => {
        expect(getInputElementByLabel("Agent name").value).toBe("agent 1");
        expect(getInputElementByLabel("Agent email").value).toBe("agent@email.com");
        expect(getInputElementByLabel("Agent office address line1").value).toBe("123 agent address");
        expect(getInputElementByLabel("Agent office address line2").value).toBe("agent suite 201");
        expect(getInputElementByLabel("Agent office address city").value).toBe("agent-city-402");
        expect(getInputElementByLabel("Agent office address state").value).toBe("DC");
        expect(getInputElementByLabel("Agent office address zip code").value).toBe("998877");
      });
    });

    it("only displays dependency alert on the first tab", async () => {
      renderWithData({});

      expect(subject.queryByTestId("dependency-alert")).toBeInTheDocument();

      await submitBusinessTab();

      expect(subject.queryByTestId("dependency-alert")).not.toBeInTheDocument();

      await submitContactsTab();

      expect(subject.queryByTestId("dependency-alert")).not.toBeInTheDocument();
    });

    it("navigates back to business tab from the contact tab", async () => {
      renderWithData({});
      await submitBusinessTab();

      fireEvent.click(subject.getByText(BusinessFormationDefaults.previousButtonText));

      await waitFor(() => {
        expect(subject.queryByTestId("business-section")).toBeInTheDocument();
      });
    });

    it("navigates back to contact tab from the payment tab", async () => {
      renderWithData({});
      await submitBusinessTab();
      await submitContactsTab();
      fireEvent.click(subject.getByText(BusinessFormationDefaults.previousButtonText));

      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });
    });

    describe("display profile data information on business tab", () => {
      it("displays legal structure from profile data", () => {
        subject = renderTask({ profileData: generateLLCProfileData({}) });
        expect(
          subject.getByText(LookupLegalStructureById("limited-liability-company").name, { exact: false })
        ).toBeInTheDocument();
      });

      it("displays business name from profile data", () => {
        const profileData = generateLLCProfileData({ businessName: "some cool name" });
        subject = renderTask({ profileData });
        expect(subject.getByText("some cool name", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText(BusinessFormationDefaults.notSetBusinessNameText, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("displays City (Main Business Address) from profile data", () => {
        const profileData = generateLLCProfileData({
          municipality: generateMunicipality({ name: "Newark" }),
        });
        subject = renderTask({ profileData });
        expect(subject.getByText("Newark", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText(BusinessFormationDefaults.notSetBusinessAddressCityLabel, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("displays placeholder text if user has not set business name", () => {
        const profileData = generateLLCProfileData({ businessName: "" });
        subject = renderTask({ profileData });
        expect(
          subject.getByText(BusinessFormationDefaults.notSetBusinessNameText, { exact: false })
        ).toBeInTheDocument();
      });
    });

    it("defaults date picker to current date when it has no value", () => {
      renderWithData({ businessStartDate: "" });
      expect(subject.getByLabelText("Business start date")).toBeInTheDocument();
    });

    it("defaults to registered agent number and toggles to manual with radio button", () => {
      renderWithData({ agentNumberOrManual: "NUMBER" });
      expect(subject.queryByTestId("agent-number")).toBeInTheDocument();
      expect(subject.queryByTestId("agent-name")).not.toBeInTheDocument();

      chooseRadio("registered-agent-manual");

      expect(subject.queryByTestId("agent-number")).not.toBeInTheDocument();
      expect(subject.queryByTestId("agent-name")).toBeInTheDocument();

      chooseRadio("registered-agent-number");

      expect(subject.queryByTestId("agent-number")).toBeInTheDocument();
      expect(subject.queryByTestId("agent-name")).not.toBeInTheDocument();
    });

    it("adds additional signers", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull", "V"]);
    });

    it("deletes an additional signer", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");
      fireEvent.click(subject.getAllByLabelText("delete additional signer")[0]);

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["V"]);
    });

    it("ignores empty signer fields", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "Red Skull");

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull"]);
    });

    it("does not add more than 10 signers", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      for (let i = 0; i < 8; i++) {
        fireEvent.click(
          subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false })
        );
      }
      expect(
        subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false })
      ).toBeInTheDocument();
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      expect(
        subject.queryByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("redirects to payment redirect URL on success", async () => {
      mockApiResponse(
        generateFormationSubmitResponse({
          success: true,
          redirect: "www.example.com",
        })
      );

      renderWithData({});
      await submitBusinessTab();
      await submitContactsTab();
      await clickSubmit();
      expect(mockPush).toHaveBeenCalledWith("www.example.com");
    });

    it("displays error messages on error and hides error when payment page is revisited", async () => {
      mockApiResponse(
        generateFormationSubmitResponse({
          success: false,
          errors: [
            generateFormationSubmitError({
              field: "some field 1",
              message: "very bad input",
              type: "RESPONSE",
            }),
            generateFormationSubmitError({
              field: "some field 2",
              message: "must be nj zipcode",
              type: "RESPONSE",
            }),
          ],
        })
      );

      renderWithData({});
      await submitBusinessTab();
      await submitContactsTab();
      await clickSubmit();
      expect(mockPush).not.toHaveBeenCalled();
      expect(subject.getByText("some field 1")).toBeInTheDocument();
      expect(subject.getByText("very bad input")).toBeInTheDocument();
      expect(subject.getByText("some field 2")).toBeInTheDocument();
      expect(subject.getByText("must be nj zipcode")).toBeInTheDocument();

      fireEvent.click(subject.getByText(BusinessFormationDefaults.previousButtonText));

      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });

      await submitContactsTab();

      expect(subject.queryByText("some field 1")).not.toBeInTheDocument();
      expect(subject.queryByText("very bad input")).not.toBeInTheDocument();
      expect(subject.queryByText("some field 2")).not.toBeInTheDocument();
      expect(subject.queryByText("must be nj zipcode")).not.toBeInTheDocument();
    });

    it("displays alert and highlights fields when submitting with missing fields", async () => {
      renderWithData({ businessAddressLine1: "" });
      await submitBusinessTab(false);
      expect(subject.getByText(BusinessFormationDefaults.businessAddressLine1ErrorText)).toBeInTheDocument();
      expect(subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)).toBeInTheDocument();
      fillText("Business address line1", "1234 main street");
      await submitBusinessTab();
      expect(
        subject.queryByText(BusinessFormationDefaults.businessAddressLine1ErrorText)
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
      ).not.toBeInTheDocument();
    });

    it("validates date on submit", async () => {
      renderWithData({ businessStartDate: dayjs().subtract(1, "day").format("YYYY-MM-DD") });
      await submitBusinessTab(false);
      expect(subject.getByText(BusinessFormationDefaults.startDateErrorText)).toBeInTheDocument();
      expect(subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)).toBeInTheDocument();
    });

    it("uses name from profile when business formation data is not set", async () => {
      const user = generateUser({ name: "Mike Jones" });
      const profileData = generateLLCProfileData({});
      subject = renderTask({
        profileData,
        user,
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({ contactFirstName: ``, contactLastName: `` }),
        }),
      });

      await submitBusinessTab();
      await submitContactsTab();
      expect(getInputElementByLabel("Contact first name").value).toEqual("Mike");
      expect(getInputElementByLabel("Contact last name").value).toEqual("Jones");
    });

    it("uses name from formation data when it exists", async () => {
      const user = generateUser({ name: "Some Wrong Name" });
      const profileData = generateLLCProfileData({});
      const formationFormData = generateFormationFormData({
        contactFirstName: "Actual",
        contactLastName: "Name",
      });
      subject = renderTask({
        profileData,
        user,
        formationData: generateFormationData({ formationFormData }),
      });

      await submitBusinessTab();
      await submitContactsTab();
      expect(getInputElementByLabel("Contact first name").value).toEqual("Actual");
      expect(getInputElementByLabel("Contact last name").value).toEqual("Name");
    });

    describe("required fields", () => {
      describe("email validation", () => {
        it("displays error message when @ is missing in email input field", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "deeb.gmail");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(subject.queryByText(BusinessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("displays error message when email domain is missing in email input field", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "deeb@");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(subject.queryByText(BusinessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("passes email validation", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "lol@deeb.gmail");

          await submitBusinessTab();
          expect(subject.queryByText(BusinessFormationDefaults.agentEmailErrorText)).not.toBeInTheDocument();
        });
      });

      describe("NJ zipcode validation", () => {
        it("displays error message when non-NJ zipcode is entered in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "22222");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(BusinessFormationDefaults.businessAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("displays error message when Alpha zipcode is entered in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "AAAAA");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(BusinessFormationDefaults.businessAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("passes zipcode validation in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "07001");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.queryByText(BusinessFormationDefaults.businessAddressZipCodeErrorText)
            ).not.toBeInTheDocument();
            expect(
              subject.queryByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).not.toBeInTheDocument();
          });
        });

        it("displays error message due to non-NJ zipcode is entered in registered agent address", async () => {
          renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent office address zip code", "22222");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(BusinessFormationDefaults.agentOfficeAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });
      });

      it("Business suffix", async () => {
        renderWithData({ businessSuffix: undefined });
        await submitBusinessTab(false);
        expect(userDataWasNotUpdated()).toEqual(true);
      });

      it("Business address line1", async () => {
        renderWithData({ businessAddressLine1: "" });
        await submitBusinessTab(false);
        expect(userDataWasNotUpdated()).toEqual(true);
      });

      it("Business address zip code", async () => {
        renderWithData({ businessAddressZipCode: "" });
        await submitBusinessTab(false);
        expect(userDataWasNotUpdated()).toEqual(true);
      });

      describe("when agent number selected", () => {
        it("agent number", () => {
          renderWithData({ agentNumber: "", agentNumberOrManual: "NUMBER" });
          expect(userDataWasNotUpdated()).toEqual(true);
        });
        describe("when agent number selected", () => {
          it("agent number", async () => {
            renderWithData({ agentNumber: "", agentNumberOrManual: "NUMBER" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        describe("when agent manual selected", () => {
          it("agent name", async () => {
            renderWithData({ agentName: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent email", async () => {
            renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent address line 1", async () => {
            renderWithData({ agentOfficeAddressLine1: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address city", async () => {
            renderWithData({ agentOfficeAddressCity: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address zip code", async () => {
            renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await submitBusinessTab(false);
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });
      });

      describe("when agent manual selected", () => {
        it("agent name", async () => {
          renderWithData({ agentName: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("agent email", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("agent address line 1", async () => {
          renderWithData({ agentOfficeAddressLine1: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Agent office address city", async () => {
          renderWithData({ agentOfficeAddressCity: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Agent office address zip code", async () => {
          renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(userDataWasNotUpdated()).toEqual(true);
        });
      });

      it("signer", async () => {
        renderWithData({ signer: "" });
        await submitBusinessTab();
        submitContactsTab(false);
        expect(userDataUpdatedNTimes()).toEqual(1);
      });

      it("Contact first name", async () => {
        renderWithData({ contactFirstName: "" });
        await submitBusinessTab();
        await submitContactsTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Contact last name", async () => {
        renderWithData({ contactLastName: "" });
        await submitBusinessTab();
        await submitContactsTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Contact phone number", async () => {
        renderWithData({ contactPhoneNumber: "" });
        await submitBusinessTab();
        await submitContactsTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Payment type", async () => {
        renderWithData({ paymentType: undefined });
        await submitBusinessTab();
        await submitContactsTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      describe("submits when missing optional field", () => {
        it("everything present", async () => {
          renderWithData({});
          await submitBusinessTab();
          await submitContactsTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("agent address line 2", async () => {
          renderWithData({ agentOfficeAddressLine2: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab();
          await submitContactsTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("business address line 2", async () => {
          renderWithData({ businessAddressLine2: "" });
          await submitBusinessTab();
          await submitContactsTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("additional signer", async () => {
          renderWithData({ additionalSigners: [] });
          await submitBusinessTab();
          await submitContactsTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });
      });
    });
  });

  const generateLLCProfileData = (data: Partial<ProfileData>): ProfileData => {
    return generateProfileData({
      legalStructureId: "limited-liability-company",
      ...data,
    });
  };

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
    fireEvent.blur(subject.getByLabelText(label));
  };

  const selectCheckBox = (label: string) => {
    fireEvent.click(subject.getByLabelText(label));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const selectDate = (value: Dayjs) => {
    const desiredValue = value.format("MMM D, YYYY");

    fireEvent.click(subject.getByLabelText(`Business start date`));

    const chosenDate = subject.getByRole("button", { name: desiredValue });
    fireEvent.click(chosenDate);
  };

  const selectNextMonth = () => {
    const today = dayjs().format("MMM D, YYYY");
    fireEvent.click(subject.getByLabelText(`Choose date, selected date is ${today}`));
    fireEvent.click(subject.getByLabelText(`Next month`));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const clickSubmit = async (): Promise<void> => {
    fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return subject.getByLabelText(label) as HTMLInputElement;
  };

  const renderWithData = (formationFormData: Partial<FormationFormData>): void => {
    const profileData = generateLLCProfileData({});
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const user = generateUser({ name: "" });
    subject = renderTask({ profileData, formationData, user });
  };

  const submitBusinessTab = async (completed = true) => {
    fireEvent.click(subject.getByText(BusinessFormationDefaults.initialNextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });
    }
  };

  const submitContactsTab = async (completed = true) => {
    fireEvent.click(subject.getByText(BusinessFormationDefaults.nextButtonText));

    if (completed)
      await waitFor(() => {
        expect(subject.queryByTestId("payment-section")).toBeInTheDocument();
      });
  };
});
