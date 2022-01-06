import { BusinessFormation } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import * as api from "@/lib/api-client/apiClient";
import {
  generateFormationData,
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
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
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  FormationFormData,
  FormationSubmitResponse,
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
jest.mock("@/lib/api-client/apiClient", () => ({ postBusinessFormation: jest.fn() }));
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
  });

  describe("when LLC", () => {
    it("shows success page when form already submitted", () => {
      const profileData = generateLLCProfileData({});
      const formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({
          success: true,
          redirect: "www.example.com/token",
        }),
      });
      subject = renderTask({ profileData, formationData });
      expect(subject.getByText(BusinessFormationDefaults.alreadySubmittedLinkText)).toBeInTheDocument();
      expect(
        subject.getByText(BusinessFormationDefaults.alreadySubmittedLinkText).getAttribute("href")
      ).toEqual("www.example.com/token");
      expect(subject.queryByLabelText("Business address line1")).not.toBeInTheDocument();
    });

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
      };

      subject = renderTask({ profileData, formationData });
      chooseRadio("registered-agent-number");

      await waitFor(() => {
        expect(subject.getByText("LTD LIABILITY CO")).toBeInTheDocument();

        const today = dayjs().format("MMM D, YYYY");
        expect(getInputElementByLabel(`Choose date, selected date is ${today}`).value).toBe(
          dayjs().format("MM/DD/YYYY")
        );

        expect(getInputElementByLabel("Business address line1").value).toBe("123 main street");
        expect(getInputElementByLabel("Business address line2").value).toBe("suite 102");
        expect(getInputElementByLabel("Business address state").value).toBe("NJ");
        expect(getInputElementByLabel("Business address zip code").value).toBe("07601");
        expect(getInputElementByLabel("Agent number").value).toBe("123465798");
        expect(getInputElementByLabel("Signer").value).toBe("signer 1");
        expect(getInputElementByLabel("Additional signer 0").value).toBe("signer 2");
        expect(getInputElementByLabel("Additional signer 1").value).toBe("signer 3");
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
    });

    it("auto-fills fields from userData if it exists with agent manual entry", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = {
        formationFormData: generateFormationFormData({
          paymentType: "ACH",
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
      };

      subject = renderTask({ profileData, formationData });
      chooseRadio("registered-agent-manual");

      await waitFor(() => {
        expect(subject.getByText(BusinessFormationDefaults.achPaymentTypeLabel)).toBeInTheDocument();
        expect(getInputElementByLabel("Agent name").value).toBe("agent 1");
        expect(getInputElementByLabel("Agent email").value).toBe("agent@email.com");
        expect(getInputElementByLabel("Agent office address line1").value).toBe("123 agent address");
        expect(getInputElementByLabel("Agent office address line2").value).toBe("agent suite 201");
        expect(getInputElementByLabel("Agent office address city").value).toBe("agent-city-402");
        expect(getInputElementByLabel("Agent office address state").value).toBe("DC");
        expect(getInputElementByLabel("Agent office address zip code").value).toBe("998877");
      });
    });

    it("fills form, submits, and updates userData", async () => {
      const profileData = generateLLCProfileData({});
      const formationData = {
        formationFormData: createEmptyFormationFormData(),
        formationResponse: undefined,
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

      fillText("Signer", "Elrond");

      fillText("Contact first name", "John");
      fillText("Contact last name", "Smith");
      fillText("Contact phone number", "123A45a678 90");

      selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
      selectCheckBox("Annual report");
      selectCheckBox("Corp watch");
      selectCheckBox("Certificate of standing");
      selectCheckBox("Certified copy of formation document");

      await clickSubmit();

      expect(subject.getByText("business name and legal structure")).toBeInTheDocument();
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

    it("defaults date picker to current date when it has no value", () => {
      renderWithData({ businessStartDate: "" });
      const today = dayjs().format("MMM D, YYYY");
      expect(subject.getByLabelText(`Choose date, selected date is ${today}`)).toBeInTheDocument();
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
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");

      await clickSubmit();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull", "V"]);
    });

    it("deletes an additional signer", async () => {
      renderWithData({ additionalSigners: [] });
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");
      fireEvent.click(subject.getAllByLabelText("delete additional signer")[0]);

      await clickSubmit();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["V"]);
    });

    it("ignores empty signer fields", async () => {
      renderWithData({ additionalSigners: [] });
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "Red Skull");

      await clickSubmit();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull"]);
    });

    it("does not add more than 10 signers", () => {
      renderWithData({ additionalSigners: [] });
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
      await clickSubmit();
      expect(mockPush).toHaveBeenCalledWith("www.example.com");
    });

    it("displays error messages on error", async () => {
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
      await clickSubmit();
      expect(mockPush).not.toHaveBeenCalled();
      expect(subject.getByText("some field 1")).toBeInTheDocument();
      expect(subject.getByText("very bad input")).toBeInTheDocument();
      expect(subject.getByText("some field 2")).toBeInTheDocument();
      expect(subject.getByText("must be nj zipcode")).toBeInTheDocument();
    });

    it("displays alert and highlights fields when submitting with missing fields", async () => {
      renderWithData({ businessAddressLine1: "" });
      await clickSubmit();
      expect(subject.getByText(BusinessFormationDefaults.businessAddressLine1ErrorText)).toBeInTheDocument();
      expect(subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)).toBeInTheDocument();
      fillText("Business address line1", "1234 main street");
      await clickSubmit();
      expect(
        subject.queryByText(BusinessFormationDefaults.businessAddressLine1ErrorText)
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
      ).not.toBeInTheDocument();
    });

    it("validates date on submit", async () => {
      renderWithData({ businessStartDate: dayjs().subtract(1, "day").format("YYYY-MM-DD") });
      await clickSubmit();
      expect(subject.getByText(BusinessFormationDefaults.startDateErrorText)).toBeInTheDocument();
      expect(subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)).toBeInTheDocument();
    });

    it("uses name from profile when business formation data is not set", async () => {
      const user = generateUser({ name: "Mike Jones" });
      const profileData = generateLLCProfileData({});
      const formationFormData = createEmptyFormationFormData();
      subject = renderTask({
        profileData,
        user,
        formationData: generateFormationData({ formationFormData }),
      });

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

      expect(getInputElementByLabel("Contact first name").value).toEqual("Actual");
      expect(getInputElementByLabel("Contact last name").value).toEqual("Name");
    });

    describe("required fields", () => {
      describe("email validation", () => {
        it("displays error message due to failed email validation", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "deeb.gmail");
          await clickSubmit();
          await waitFor(() => {
            expect(subject.queryByText(BusinessFormationDefaults.agentEmailErrorText)).toBeInTheDocument();
            expect(
              subject.getByText(BusinessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("displays error message due to failed email validation", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "deeb@");
          await clickSubmit();
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

          await clickSubmit();
          await waitFor(() => {
            expect(
              subject.queryByText(BusinessFormationDefaults.agentEmailErrorText)
            ).not.toBeInTheDocument();
          });
        });
      });

      describe("NJ zipcode validation", () => {
        it("displays error message when non-NJ zipcode is entered in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "22222");

          await clickSubmit();
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

          await clickSubmit();
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
          await clickSubmit();
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
          await clickSubmit();
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
      describe("does not submit when missing a required field", () => {
        it("Business suffix", async () => {
          renderWithData({ businessSuffix: undefined });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address line1", async () => {
          renderWithData({ businessAddressLine1: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address zip code", async () => {
          renderWithData({ businessAddressZipCode: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("signer", async () => {
          renderWithData({ signer: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Contact first name", async () => {
          renderWithData({ contactFirstName: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Contact last name", async () => {
          renderWithData({ contactLastName: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Contact phone number", async () => {
          renderWithData({ contactPhoneNumber: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Payment type", async () => {
          renderWithData({ paymentType: undefined });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        describe("when agent number selected", () => {
          it("agent number", async () => {
            renderWithData({ agentNumber: "", agentNumberOrManual: "NUMBER" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        describe("when agent manual selected", () => {
          it("agent name", async () => {
            renderWithData({ agentName: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent email", async () => {
            renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent address line 1", async () => {
            renderWithData({ agentOfficeAddressLine1: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address city", async () => {
            renderWithData({ agentOfficeAddressCity: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address zip code", async () => {
            renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });
      });

      describe("submits when missing optional field", () => {
        it("everything present", async () => {
          renderWithData({});
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("agent address line 2", async () => {
          renderWithData({ agentOfficeAddressLine2: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("business address line 2", async () => {
          renderWithData({ businessAddressLine2: "" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("additional signer", async () => {
          renderWithData({ additionalSigners: [] });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
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
    const today = dayjs().format("MMM D, YYYY");
    const desiredValue = value.format("MMM D, YYYY");
    fireEvent.click(subject.getByLabelText(`Choose date, selected date is ${today}`));
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
    };
    const user = generateUser({ name: "" });
    subject = renderTask({ profileData, formationData, user });
  };
});
