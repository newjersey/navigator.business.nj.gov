import { BusinessFormation } from "@/components/tasks/BusinessFormation";
import * as api from "@/lib/api-client/apiClient";
import {
  generateFormationData,
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationMember,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  generateStateInput,
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
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyFormationFormData,
  FormationFormData,
  FormationMember,
  FormationSubmitResponse,
  GetFilingResponse,
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
  const displayContent = generateFormationDisplayContent({
    officialFormationDocument: {
      contentMd: "Official formation document",
      cost: 125,
    },
    certificateOfStanding: {
      contentMd: "Certificate of standing",
      cost: 50,
      optionalLabel: "",
    },
    certifiedCopyOfFormationDocument: {
      contentMd: "Certified copy of formation document",
      cost: 25,
      optionalLabel: "",
    },
  });

  const renderTask = (userData: Partial<UserData>): RenderResult => {
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

      const renderWithFilingResponse = (overrides: Partial<GetFilingResponse>): void => {
        getFilingResponse = generateGetFilingResponse({ success: true, ...overrides });
        const profileData = generateLLCProfileData({});
        const formationData = generateFormationData({ getFilingResponse });
        subject = renderTask({ profileData, formationData });
      };

      it("displays success page, documents, entity id, confirmation id", () => {
        renderWithFilingResponse({});
        expect(subject.getByText(Config.businessFormationDefaults.successPageHeader)).toBeInTheDocument();
        expect(subject.getByText(Config.businessFormationDefaults.successPageSubheader)).toBeInTheDocument();
        expect(subject.getByText(getFilingResponse.entityId)).toBeInTheDocument();
        expect(subject.getByText(getFilingResponse.confirmationNumber)).toBeInTheDocument();
        expect(
          subject.getByTestId(Config.businessFormationDefaults.formationDocLabel).getAttribute("href")
        ).toEqual(getFilingResponse.formationDoc);
        expect(
          subject.getByTestId(Config.businessFormationDefaults.standingDocLabel).getAttribute("href")
        ).toEqual(getFilingResponse.standingDoc);
        expect(
          subject.getByTestId(Config.businessFormationDefaults.certifiedDocLabel).getAttribute("href")
        ).toEqual(getFilingResponse.certifiedDoc);
      });

      it("shows expiration date as transaction date plus 30 days", () => {
        renderWithFilingResponse({});
        const datePlusThirty = dayjs(getFilingResponse.transactionDate).add(30, "days").format("MM/DD/YYYY");
        expect(subject.getByText(datePlusThirty, { exact: false })).toBeInTheDocument();
      });

      it("does not display documents when they are not present", () => {
        renderWithFilingResponse({ certifiedDoc: "" });
        expect(
          subject.queryByTestId(Config.businessFormationDefaults.certifiedDocLabel)
        ).not.toBeInTheDocument();
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

      const member: FormationMember = {
        name: "Joe Biden",
        addressLine1: "1600 Pennsylvania Ave NW",
        addressLine2: "Office of the President",
        addressCity: "Washington",
        addressState: "DC",
        addressZipCode: "20500",
      };
      expect(subject.getByText(displayContent.members.placeholder as string)).toBeInTheDocument();

      await fillAndSubmitMemberModal(member);

      fillText("Signer", "Elrond");
      await submitContactsTab();
      await submitReviewTab();

      fillText("Contact first name", "John");
      fillText("Contact last name", "Smith");
      fillText("Contact phone number", "123A45a678 90");
      fireEvent.click(subject.getByLabelText("Credit card"));
      selectCheckBox(Config.businessFormationDefaults.optInAnnualReportText);
      selectCheckBox(Config.businessFormationDefaults.optInCorpWatchText);
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
        expect(formationFormData.members[0].name).toEqual(member.name);
        expect(formationFormData.members[0].addressLine1).toEqual(member.addressLine1);
        expect(formationFormData.members[0].addressLine2).toEqual(member.addressLine2);
        expect(formationFormData.members[0].addressCity).toEqual(member.addressCity);
        expect(formationFormData.members[0].addressState).toEqual("DC");
        expect(formationFormData.members[0].addressZipCode).toEqual("20500");
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
          members: [
            {
              name: "Joe Biden",
              addressCity: "Washington",
              addressLine1: "1600 Pennsylvania Ave NW",
              addressLine2: "Office of the President",
              addressState: "District of Columbia",
              addressZipCode: "20500",
            },
          ],
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

      expect(subject.queryByText(displayContent.members.placeholder as string)).not.toBeInTheDocument();
      expect(subject.getByText(formationData.formationFormData.members[0].name)).toBeInTheDocument();
      expect(
        subject.getByText(formationData.formationFormData.members[0].addressLine1, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.getByText(formationData.formationFormData.members[0].addressLine2, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.getByText(formationData.formationFormData.members[0].addressCity, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.getByText(formationData.formationFormData.members[0].addressState, { exact: false })
      ).toBeInTheDocument();
      expect(
        subject.getByText(formationData.formationFormData.members[0].addressZipCode, { exact: false })
      ).toBeInTheDocument();
      expect(getInputElementByLabel("Signer").value).toBe("signer 1");
      expect(getInputElementByLabel("Additional signer 0").value).toBe("signer 2");
      expect(getInputElementByLabel("Additional signer 1").value).toBe("signer 3");

      await submitContactsTab();
      await submitReviewTab();

      expect(
        subject.getByText(Config.businessFormationDefaults.creditCardPaymentTypeLabel)
      ).toBeInTheDocument();
      expect(getInputElementByLabel("Contact first name").value).toBe("John");
      expect(getInputElementByLabel("Contact last name").value).toBe("Smith");
      expect(getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
      expect(getInputElementByLabel(Config.businessFormationDefaults.optInAnnualReportText).checked).toBe(
        true
      );
      expect(getInputElementByLabel(Config.businessFormationDefaults.optInCorpWatchText).checked).toBe(true);
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
          agentOfficeAddressZipCode: `99887`,
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
        expect(getInputElementByLabel("Agent office address zip code").value).toBe("99887");
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

    it("navigates from business tab to payment tab and back to business tab", async () => {
      renderWithData({});
      await submitBusinessTab();
      await submitContactsTab();
      await submitReviewTab();

      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));
      await waitFor(() => {
        expect(subject.getByTestId("review-section")).toBeInTheDocument();
      });

      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });

      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));
      await waitFor(() => {
        expect(subject.queryByTestId("business-section")).toBeInTheDocument();
      });
    });

    it("routes to profile page when edit business name button is clicked", async () => {
      renderWithData({});
      fireEvent.click(subject.getByTestId("edit-business-name"));
      expect(mockPush).toHaveBeenCalledWith("/profile?path=businessFormation");
    });

    it("routes to profile page when edit legal structure button is clicked", async () => {
      renderWithData({});
      fireEvent.click(subject.getByTestId("edit-legal-structure"));
      expect(mockPush).toHaveBeenCalledWith("/profile?path=businessFormation");
    });

    describe("navigates from the review page", () => {
      it("displays the first tab when the edit button in the main business section is clicked", async () => {
        renderWithData({});
        await submitBusinessTab();
        await submitContactsTab();
        fireEvent.click(subject.getByTestId("edit-business-name-section"));

        await waitFor(() => {
          expect(subject.queryByTestId("business-section")).toBeInTheDocument();
        });
      });

      it("displays the first tab when the edit button in the location section is clicked", async () => {
        renderWithData({});
        await submitBusinessTab();
        await submitContactsTab();
        fireEvent.click(subject.getByTestId("edit-location-section"));

        await waitFor(() => {
          expect(subject.queryByTestId("business-section")).toBeInTheDocument();
        });
      });

      it("displays the second tab when the edit button in the registered agent section is clicked", async () => {
        renderWithData({});
        await submitBusinessTab();
        await submitContactsTab();
        fireEvent.click(subject.getByTestId("edit-registered-agent-section"));

        await waitFor(() => {
          expect(subject.queryByTestId("business-section")).toBeInTheDocument();
        });
      });

      it("displays the second tab when the edit button in the signatures section is clicked", async () => {
        renderWithData({});
        await submitBusinessTab();
        await submitContactsTab();
        fireEvent.click(subject.getByTestId("edit-signature-section"));

        await waitFor(() => {
          expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
        });
      });

      it("displays the second tab when the edit button in the members section is clicked", async () => {
        renderWithData({});
        await submitBusinessTab();
        await submitContactsTab();
        fireEvent.click(subject.getByTestId("edit-members-section"));

        await waitFor(() => {
          expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
        });
      });

      it("displays agent number on review tab", async () => {
        renderWithData({ agentNumberOrManual: "NUMBER" });
        await submitBusinessTab();
        await submitContactsTab();
        expect(subject.getByTestId("agent-number")).toBeInTheDocument();
        expect(subject.queryByTestId("agent-manual-entry")).not.toBeInTheDocument();
      });

      it("displays manually entered registered agent info on review tab", async () => {
        renderWithData({ agentNumberOrManual: "MANUAL_ENTRY" });
        await submitBusinessTab();
        await submitContactsTab();
        expect(subject.queryByTestId("agent-number")).not.toBeInTheDocument();
        expect(subject.getByTestId("agent-manual-entry")).toBeInTheDocument();
      });

      it("does not display members section within review tab when members do not exist", async () => {
        renderWithData({ members: [] });
        await submitBusinessTab();
        await submitContactsTab();
        expect(subject.queryByTestId("edit-members-section")).not.toBeInTheDocument();
      });
    });

    describe("display profile data information on business tab", () => {
      it("displays legal structure from profile data", () => {
        subject = renderTask({ profileData: generateLLCProfileData({}) });
        const displayLegalStructure = subject.getByTestId("legal-structure");

        expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llcText);
      });

      it("displays business name from profile data", () => {
        const profileData = generateLLCProfileData({ businessName: "some cool name" });
        subject = renderTask({ profileData });
        expect(subject.getByText("some cool name", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.notSetBusinessNameText, { exact: false })
        ).not.toBeInTheDocument();
      });

      it("displays City (Main Business Address) from profile data", () => {
        const profileData = generateLLCProfileData({
          municipality: generateMunicipality({ name: "Newark" }),
        });
        subject = renderTask({ profileData });
        expect(subject.getByText("Newark", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.notSetBusinessAddressCityLabel, {
            exact: false,
          })
        ).not.toBeInTheDocument();
      });

      it("displays placeholder text if user has not set business name", () => {
        const profileData = generateLLCProfileData({ businessName: "" });
        subject = renderTask({ profileData });
        expect(
          subject.getByText(Config.businessFormationDefaults.notSetBusinessNameText, { exact: false })
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
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fillText("Additional signer 1", "V");

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull", "V"]);
    });

    it("deletes an additional signer", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fillText("Additional signer 1", "V");
      fireEvent.click(subject.getAllByLabelText("delete additional signer")[0]);

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["V"]);
    });

    it("ignores empty signer fields", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      fillText("Additional signer 1", "Red Skull");

      await submitContactsTab();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull"]);
    });

    it("does not add more than 10 signers", async () => {
      renderWithData({ additionalSigners: [] });

      await submitBusinessTab();
      for (let i = 0; i < 8; i++) {
        fireEvent.click(
          subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
        );
      }
      expect(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      ).toBeInTheDocument();
      fireEvent.click(
        subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      );
      expect(
        subject.queryByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
      ).not.toBeInTheDocument();
    });

    describe("add and manipulate members", () => {
      it("edits members", async () => {
        const members = [...Array(2)].map(() => generateFormationMember({}));
        renderWithData({
          members,
        });
        await submitBusinessTab();
        expect(
          subject.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();
        const nameTd = subject.getByText(members[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        expect(
          subject.getByText(
            `${members[1].addressLine1}, ${members[1].addressLine2}, ${members[1].addressCity}, ${members[1].addressState} ${members[1].addressZipCode}`,
            { exact: false }
          )
        ).toBeInTheDocument();
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="edit"]') as Element);
        expect(getInputElementByLabel("Member name").value).toBe(members[1].name);
        expect(getInputElementByLabel("Member address line1").value).toBe(members[1].addressLine1);
        expect(getInputElementByLabel("Member address line2").value).toBe(members[1].addressLine2);
        expect(getInputElementByLabel("Member address city").value).toBe(members[1].addressCity);
        expect(getInputElementByLabel("Member address state").value).toBe(members[1].addressState);
        expect(getInputElementByLabel("Member address zip code").value).toBe(members[1].addressZipCode);
        const newName = "Joe Biden";
        fillText("Member name", newName);
        clickMemberSubmit();
        await waitFor(() => {
          expect(
            subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
        expect(subject.getByText(newName, { exact: false })).toBeInTheDocument();
        await submitContactsTab();
        const newMembers = currentUserData().formationData.formationFormData.members;
        expect(newMembers.length).toEqual(2);
        expect(newMembers.findIndex((member) => member.name == newName)).toEqual(1);
      });

      it("is able to delete members", async () => {
        const members = [...Array(2)].map(() => generateFormationMember({}));
        renderWithData({
          members,
        });
        await submitBusinessTab();
        const nameTd = subject.getByText(members[1].name, { exact: false });
        expect(nameTd).toBeInTheDocument();
        fireEvent.click(nameTd.parentElement?.querySelector('button[aria-label="delete"]') as Element);
        await submitContactsTab();
        const newMembers = currentUserData().formationData.formationFormData.members;
        expect(newMembers.length).toEqual(1);
        expect(newMembers.find((member) => member == members[1])).toBeFalsy();
      });

      it("does not show checkbox in modal if agent set using number", async () => {
        renderWithData({ agentNumberOrManual: "NUMBER" });
        await submitBusinessTab();
        await openMemberModal();
        expect(
          subject.queryByLabelText(displayContent.membersModal.sameNameCheckboxText)
        ).not.toBeInTheDocument();
      });

      it("adds members using registered agent data using checkbox", async () => {
        renderWithData({
          agentNumberOrManual: "MANUAL_ENTRY",
          members: [],
          agentName: `agent 1`,
          agentEmail: `agent@email.com`,
          agentOfficeAddressLine1: `123 agent address`,
          agentOfficeAddressLine2: `agent suite 201`,
          agentOfficeAddressCity: `agent-city-402`,
          agentOfficeAddressState: "NJ",
          agentOfficeAddressZipCode: `07601`,
        });
        await submitBusinessTab();
        await openMemberModal();
        selectCheckBox(displayContent.membersModal.sameNameCheckboxText);
        expect(getInputElementByLabel("Member name").value).toBe("agent 1");
        expect(getInputElementByLabel("Member address line1").value).toBe("123 agent address");
        expect(getInputElementByLabel("Member address line2").value).toBe("agent suite 201");
        expect(getInputElementByLabel("Member address city").value).toBe("agent-city-402");
        expect(getInputElementByLabel("Member address state").value).toBe("NJ");
        expect(getInputElementByLabel("Member address zip code").value).toBe("07601");
      });

      it("shows validation on submit", async () => {
        renderWithData({});
        await submitBusinessTab();
        await openMemberModal();
        clickMemberSubmit();
        expect(
          subject.queryByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
        ).toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
        ).toBeInTheDocument();
        await fillMemberModal({});
        expect(
          subject.queryByText(Config.businessFormationDefaults.nameErrorText, { exact: false })
        ).not.toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressErrorText, { exact: false })
        ).not.toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressCityErrorText, { exact: false })
        ).not.toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressStateErrorText, { exact: false })
        ).not.toBeInTheDocument();
        expect(
          subject.queryByText(Config.businessFormationDefaults.addressZipCodeErrorText, { exact: false })
        ).not.toBeInTheDocument();
        clickMemberSubmit();
        await waitFor(() => {
          expect(
            subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
          ).toBeInTheDocument();
        });
      });

      it("resets form on cancel", async () => {
        renderWithData({ agentNumberOrManual: "MANUAL_ENTRY" });
        await submitBusinessTab();
        await openMemberModal();
        selectCheckBox(displayContent.membersModal.sameNameCheckboxText);
        fireEvent.click(subject.getByTestId("memberCancel"));
        await openMemberModal();
        expect(getInputElementByLabel("Member name").value).toBe("");
      });

      it("does not add more than 10 members", async () => {
        renderWithData({ members: [], agentNumberOrManual: "MANUAL_ENTRY" });
        await submitBusinessTab();

        for (let i = 0; i < 9; i++) {
          await fillAndSubmitMemberModal({});
        }
        expect(
          subject.getByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).toBeInTheDocument();

        await openMemberModal();
        selectCheckBox(displayContent.membersModal.sameNameCheckboxText);
        clickMemberSubmit();

        expect(
          subject.queryByText(Config.businessFormationDefaults.membersNewButtonText, { exact: false })
        ).not.toBeInTheDocument();
        await submitContactsTab();
        expect(currentUserData().formationData.formationFormData.members.length).toEqual(10);
      });
    });

    it("updates total and subtotals correctly", async () => {
      renderWithData({
        paymentType: undefined,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: false,
      });
      await submitBusinessTab();
      await submitContactsTab();
      await submitReviewTab();
      expect(subject.getByLabelText("Subtotal")).toHaveTextContent(
        displayContent.officialFormationDocument.cost.toString()
      );
      selectCheckBox("Certificate of standing");
      expect(subject.getByLabelText("Subtotal")).toHaveTextContent(
        (displayContent.officialFormationDocument.cost + displayContent.certificateOfStanding.cost).toString()
      );
      selectCheckBox("Certified copy of formation document");
      expect(subject.getByLabelText("Subtotal")).toHaveTextContent(
        (
          displayContent.officialFormationDocument.cost +
          displayContent.certificateOfStanding.cost +
          displayContent.certifiedCopyOfFormationDocument.cost
        ).toString()
      );
      expect(subject.getByLabelText("Total")).toHaveTextContent(
        (
          displayContent.officialFormationDocument.cost +
          displayContent.certificateOfStanding.cost +
          displayContent.certifiedCopyOfFormationDocument.cost
        ).toString()
      );
      selectCheckBox("Certified copy of formation document");
      expect(subject.getByLabelText("Subtotal")).toHaveTextContent(
        (displayContent.officialFormationDocument.cost + displayContent.certificateOfStanding.cost).toString()
      );
      expect(subject.getByLabelText("Total")).toHaveTextContent(
        (displayContent.officialFormationDocument.cost + displayContent.certificateOfStanding.cost).toString()
      );
      fireEvent.click(subject.getByLabelText("Credit card"));
      expect(subject.getByLabelText("Total")).toHaveTextContent(
        (
          displayContent.officialFormationDocument.cost +
          displayContent.certificateOfStanding.cost +
          parseFloat(Config.businessFormationDefaults.creditCardPaymentCostInitial) +
          parseFloat(Config.businessFormationDefaults.creditCardPaymentCostExtra)
        ).toString()
      );
      fireEvent.click(subject.getByLabelText("E check"));
      expect(subject.getByLabelText("Total")).toHaveTextContent(
        (
          displayContent.officialFormationDocument.cost +
          displayContent.certificateOfStanding.cost +
          parseFloat(Config.businessFormationDefaults.achPaymentCost) * 2
        ).toString()
      );
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
      await submitReviewTab();
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
      await submitReviewTab();
      await clickSubmit();
      expect(mockPush).not.toHaveBeenCalled();
      expect(subject.getByText("some field 1")).toBeInTheDocument();
      expect(subject.getByText("very bad input")).toBeInTheDocument();
      expect(subject.getByText("some field 2")).toBeInTheDocument();
      expect(subject.getByText("must be nj zipcode")).toBeInTheDocument();

      fireEvent.click(subject.getByText(Config.businessFormationDefaults.previousButtonText));

      await waitFor(() => {
        expect(subject.getByTestId("review-section")).toBeInTheDocument();
      });

      await submitReviewTab();

      expect(subject.queryByText("some field 1")).not.toBeInTheDocument();
      expect(subject.queryByText("very bad input")).not.toBeInTheDocument();
      expect(subject.queryByText("some field 2")).not.toBeInTheDocument();
      expect(subject.queryByText("must be nj zipcode")).not.toBeInTheDocument();
    });

    it("displays alert and highlights fields when submitting with missing fields", async () => {
      renderWithData({ businessAddressLine1: "" });
      await submitBusinessTab(false);
      expect(
        subject.getByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
      ).toBeInTheDocument();
      expect(
        subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
      fillText("Business address line1", "1234 main street");
      await submitBusinessTab();
      expect(
        subject.queryByText(Config.businessFormationDefaults.businessAddressLine1ErrorText)
      ).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).not.toBeInTheDocument();
    });

    it("resets date on initial load", async () => {
      renderWithData({ businessStartDate: dayjs().subtract(1, "day").format("YYYY-MM-DD") });
      expect(subject.getByLabelText("Business start date")).toHaveValue(dayjs().format("MM/DD/YYYY"));
      await submitBusinessTab(true);
    });

    it("validates date on submit", async () => {
      renderWithData({});
      selectDate(dayjs().subtract(4, "day"));
      await submitBusinessTab(false);
      expect(subject.getByText(Config.businessFormationDefaults.startDateErrorText)).toBeInTheDocument();
      expect(
        subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
      ).toBeInTheDocument();
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
      await submitReviewTab();
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
      await submitReviewTab();
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
            expect(
              subject.queryByText(Config.businessFormationDefaults.agentEmailErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("displays error message when email domain is missing in email input field", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "deeb@");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.queryByText(Config.businessFormationDefaults.agentEmailErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("passes email validation", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent email", "lol@deeb.gmail");

          await submitBusinessTab();
          expect(
            subject.queryByText(Config.businessFormationDefaults.agentEmailErrorText)
          ).not.toBeInTheDocument();
        });
      });

      describe("NJ zipcode validation", () => {
        it("displays error message when non-NJ zipcode is entered in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "22222");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("displays error message when Alpha zipcode is entered in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "AAAAA");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(Config.businessFormationDefaults.businessAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });

        it("passes zipcode validation in main business address", async () => {
          renderWithData({ businessAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Business address zip code", "07001");
          await submitBusinessTab(true);
        });

        it("displays error message due to non-NJ zipcode is entered in registered agent address", async () => {
          renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          fillText("Agent office address zip code", "22222");

          await submitBusinessTab(false);
          await waitFor(() => {
            expect(
              subject.getByText(Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText)
            ).toBeInTheDocument();
            expect(
              subject.getByText(Config.businessFormationDefaults.missingFieldsOnSubmitModalText)
            ).toBeInTheDocument();
          });
        });
      });

      it("Business suffix", async () => {
        renderWithData({ businessSuffix: undefined });
        await submitBusinessTab(false);
        expect(subject.getByRole("alert")).toHaveTextContent(/Business suffix/);
      });

      it("Business name", async () => {
        renderWithData({}, { businessName: undefined });
        await submitBusinessTab(false);
        expect(
          subject.getByText(Config.businessFormationDefaults.notSetBusinessNameErrorText)
        ).toBeInTheDocument();
        expect(subject.getByRole("alert")).toHaveTextContent(/Business name/);
      });

      it("Business address line1", async () => {
        renderWithData({ businessAddressLine1: "" });
        await submitBusinessTab(false);
        expect(subject.getByRole("alert")).toHaveTextContent(/Business address line1/);
      });

      it("Business address zip code", async () => {
        renderWithData({ businessAddressZipCode: "" });
        await submitBusinessTab(false);
        expect(subject.getByRole("alert")).toHaveTextContent(/Business address zip code/);
      });

      describe("when agent number selected", () => {
        it("agent number", async () => {
          renderWithData({ agentNumber: "", agentNumberOrManual: "NUMBER" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent number/);
        });
      });

      describe("when agent manual selected", () => {
        it("agent name", async () => {
          renderWithData({ agentName: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent name/);
        });

        it("agent email", async () => {
          renderWithData({ agentEmail: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent email/);
        });

        it("agent address line 1", async () => {
          renderWithData({ agentOfficeAddressLine1: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent office address line1/);
        });

        it("Agent office address city", async () => {
          renderWithData({ agentOfficeAddressCity: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent office address city/);
        });

        it("Agent office address zip code", async () => {
          renderWithData({ agentOfficeAddressZipCode: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab(false);
          expect(subject.getByRole("alert")).toHaveTextContent(/Agent office address zip code/);
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
        await submitReviewTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Contact last name", async () => {
        renderWithData({ contactLastName: "" });
        await submitBusinessTab();
        await submitContactsTab();
        await submitReviewTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Contact phone number", async () => {
        renderWithData({ contactPhoneNumber: "" });
        await submitBusinessTab();
        await submitContactsTab();
        await submitReviewTab();
        await clickSubmit();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      it("Payment type", async () => {
        renderWithData({ paymentType: undefined });
        await submitBusinessTab();
        await submitContactsTab();
        await submitReviewTab();
        await clickSubmit();
        expect(subject.getByText(Config.businessFormationDefaults.paymentTypeErrorText)).toBeInTheDocument();
        expect(userDataUpdatedNTimes()).toEqual(2);
      });

      describe("submits when missing optional field", () => {
        it("everything present", async () => {
          renderWithData({});
          await submitBusinessTab();
          await submitContactsTab();
          await submitReviewTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("agent address line 2", async () => {
          renderWithData({ agentOfficeAddressLine2: "", agentNumberOrManual: "MANUAL_ENTRY" });
          await submitBusinessTab();
          await submitContactsTab();
          await submitReviewTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("business address line 2", async () => {
          renderWithData({ businessAddressLine2: "" });
          await submitBusinessTab();
          await submitContactsTab();
          await submitReviewTab();
          await clickSubmit();
          expect(userDataUpdatedNTimes()).toEqual(3);
        });

        it("additional signer", async () => {
          renderWithData({ additionalSigners: [] });
          await submitBusinessTab();
          await submitContactsTab();
          await submitReviewTab();
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
    fillText("Business start date", value.format("MM/DD/YYYY"));
    fireEvent.blur(subject.getByLabelText("Business start date"));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const openMemberModal = async (): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.membersNewButtonText));
    await waitFor(() => {
      expect(
        subject.getByText(Config.businessFormationDefaults.membersModalNextButtonText)
      ).toBeInTheDocument();
    });
  };

  const clickMemberSubmit = () => {
    fireEvent.click(subject.getByTestId("memberSubmit"));
  };

  const fillMemberModal = async (overrides: Partial<FormationMember>) => {
    const member = generateFormationMember({ addressState: generateStateInput(), ...overrides });
    fillText("Member name", member.name);
    fillText("Member address line1", member.addressLine1);
    fillText("Member address line2", member.addressLine2);
    fillText("Member address city", member.addressCity);
    fillText("Member address state", member.addressState);
    fillText("Member address zip code", member.addressZipCode);
  };

  const fillAndSubmitMemberModal = async (overrides: Partial<FormationMember>) => {
    await openMemberModal();
    await fillMemberModal(overrides);
    clickMemberSubmit();
    await waitFor(() => {
      expect(
        subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
      ).toBeInTheDocument();
    });
  };

  const clickSubmit = async (): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return subject.getByLabelText(label) as HTMLInputElement;
  };

  const renderWithData = (
    formationFormData: Partial<FormationFormData>,
    profileData: Partial<ProfileData> = {}
  ): void => {
    const llcProfileData = generateLLCProfileData(profileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const user = generateUser({ name: "" });
    subject = renderTask({ profileData: llcProfileData, formationData, user });
  };

  const submitBusinessTab = async (completed = true) => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.initialNextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });
    } else {
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).not.toBeInTheDocument();
      });
    }
  };

  const submitContactsTab = async (completed = true) => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed)
      await waitFor(() => {
        expect(subject.queryByTestId("review-section")).toBeInTheDocument();
      });
  };

  const submitReviewTab = async () => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.nextButtonText));

    await waitFor(() => {
      expect(subject.queryByTestId("payment-section")).toBeInTheDocument();
    });
  };
});
