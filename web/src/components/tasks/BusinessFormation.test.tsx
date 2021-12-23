import { BusinessFormation } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import * as api from "@/lib/api-client/apiClient";
import {
  generateFormationData,
  generateFormationDisplayContent,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateMunicipality,
  generateProfileData,
  generateTask,
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
      optInAnnualReport: { contentMd: "annual report" },
      optInCorpWatch: { contentMd: "corp watch" },
      officialFormationDocument: {
        contentMd: "",
        cost: "$125.00",
      },
      certificateOfStanding: {
        contentMd: "certificate of standing",
        cost: "$50.00",
        optionalLabel: "",
      },
      certifiedCopyOfFormationDocument: {
        contentMd: "certified copy of formation document",
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
    const generateLLCProfileData = (data: Partial<ProfileData>): ProfileData => {
      return generateProfileData({
        legalStructureId: "limited-liability-company",
        ...data,
      });
    };

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
        municipality: generateMunicipality({
          name: "Newark",
        }),
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

    it("updates userData when business formation data is submitted", async () => {
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });

      selectByText("Business suffix", "LLC");
      const threeDaysFromNow = dayjs().add(3, "days");
      selectDate(threeDaysFromNow);
      fillText("Business address line1", "1234 main street");
      fillText("Business address line2", "Suite 304");
      fillText("Business address zip code", "12345");

      chooseRadio("registered-agent-manual");
      fillText("Agent name", "Hugo Weaving");
      fillText("Agent email", "name@example.com");
      fillText("Agent office address line1", "400 Pennsylvania Ave");
      fillText("Agent office address line2", "Suite 101");
      fillText("Agent office address city", "Newark");
      fillText("Agent office address zip code", "45678");

      fillText("Signer", "Elrond");

      selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
      selectCheckBox("annual report");
      selectCheckBox("corp watch");
      selectCheckBox("certificate of standing");
      selectCheckBox("certified copy of formation document");

      await clickSubmit();

      expect(subject.getByText("business name and legal structure")).toBeInTheDocument();
      const formationFormData = currentUserData().formationData.formationFormData;
      expect(formationFormData.businessSuffix).toEqual("LLC");
      expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format("YYYY-MM-DD"));
      expect(formationFormData.businessAddressLine1).toEqual("1234 main street");
      expect(formationFormData.businessAddressLine2).toEqual("Suite 304");
      expect(formationFormData.businessAddressState).toEqual("NJ");
      expect(formationFormData.businessAddressZipCode).toEqual("12345");
      expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
      expect(formationFormData.agentNumber).toEqual("");
      expect(formationFormData.agentName).toEqual("Hugo Weaving");
      expect(formationFormData.agentEmail).toEqual("name@example.com");
      expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
      expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
      expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
      expect(formationFormData.agentOfficeAddressState).toEqual("NJ");
      expect(formationFormData.agentOfficeAddressZipCode).toEqual("45678");
      expect(formationFormData.signer).toEqual("Elrond");
      expect(formationFormData.additionalSigners).toEqual([]);
      expect(formationFormData.paymentType).toEqual("CC");
      expect(formationFormData.officialFormationDocument).toEqual(true);
      expect(formationFormData.certificateOfStanding).toEqual(true);
      expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
      expect(subject.getByText("$200.00")).toBeInTheDocument();
      expect(formationFormData.annualReportNotification).toEqual(true);
      expect(formationFormData.corpWatchNotification).toEqual(true);
    });

    it("defaults date picker to current date when it has no value", () => {
      const profileData = generateLLCProfileData({});
      const formationFormData = createEmptyFormationFormData();
      subject = renderTask({ profileData, formationData: generateFormationData({ formationFormData }) });

      const today = dayjs().format("MMM D, YYYY");
      expect(subject.getByLabelText(`Choose date, selected date is ${today}`)).toBeInTheDocument();
    });

    it("defaults to registered agent number and toggles to manual with radio button", () => {
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });

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
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });
      fillAllFieldsBut(["Additional signer"]);
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");

      await clickSubmit();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["Red Skull", "V"]);
    });

    it("deletes an additional signer", async () => {
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });
      fillAllFieldsBut(["Additional signer"]);
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 1", "V");
      fireEvent.click(subject.getAllByLabelText("delete additional signer")[0]);

      await clickSubmit();
      expect(currentUserData().formationData.formationFormData.additionalSigners).toEqual(["V"]);
    });

    it("ignores empty signer fields", async () => {
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });
      fillAllFieldsBut(["Additional signer"]);
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
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });
      fillAllFieldsBut(["Additional signer"]);
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
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });

      mockApiResponse(
        generateFormationSubmitResponse({
          success: true,
          redirect: "www.example.com",
        })
      );

      fillAllFieldsBut([]);
      await clickSubmit();
      expect(mockPush).toHaveBeenCalledWith("www.example.com");
    });

    it("displays error messages on error", async () => {
      const profileData = generateLLCProfileData({});
      subject = renderTask({ profileData });

      mockApiResponse(
        generateFormationSubmitResponse({
          success: false,
          errors: [
            generateFormationSubmitError({ field: "some field 1", message: "very bad input" }),
            generateFormationSubmitError({ field: "some field 2", message: "must be nj zipcode" }),
          ],
        })
      );

      fillAllFieldsBut([]);
      await clickSubmit();
      expect(mockPush).not.toHaveBeenCalled();
      expect(subject.getByText("some field 1")).toBeInTheDocument();
      expect(subject.getByText("very bad input")).toBeInTheDocument();
      expect(subject.getByText("some field 2")).toBeInTheDocument();
      expect(subject.getByText("must be nj zipcode")).toBeInTheDocument();
    });

    describe("required fields", () => {
      beforeEach(() => {
        const profileData = generateLLCProfileData({});
        subject = renderTask({ profileData });
      });

      describe("does not submit when missing a required field", () => {
        it("Business suffix", async () => {
          fillAllFieldsBut(["Business suffix"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address line1", async () => {
          fillAllFieldsBut(["Business address line1"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address zip code", async () => {
          fillAllFieldsBut(["Business address zip code"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("signer", async () => {
          fillAllFieldsBut(["Signer"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Payment type", async () => {
          fillAllFieldsBut(["Payment type"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        describe("when agent number selected", () => {
          it("agent number", async () => {
            fillAllFieldsBut(["Agent number"], { agentRadio: "NUMBER" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        describe("when agent manual selected", () => {
          it("agent name", async () => {
            fillAllFieldsBut(["Agent name"], { agentRadio: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent email", async () => {
            fillAllFieldsBut(["Agent email"], { agentRadio: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent address line 1", async () => {
            fillAllFieldsBut(["Agent office address line1"], { agentRadio: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address city", async () => {
            fillAllFieldsBut(["Agent office address line1", "Agent office address city"], {
              agentRadio: "MANUAL_ENTRY",
            });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address zip code", async () => {
            fillAllFieldsBut(["Agent office address zip code"], { agentRadio: "MANUAL_ENTRY" });
            await clickSubmit();
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });
      });

      describe("submits when missing optional field", () => {
        it("everything present", async () => {
          fillAllFieldsBut([]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("agent address line 2", async () => {
          fillAllFieldsBut(["Agent office address line2"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("business address line 2", async () => {
          fillAllFieldsBut(["Business address line2"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("Opt in annual report", async () => {
          fillAllFieldsBut(["Opt in annual report"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("Opt in corp watch", async () => {
          fillAllFieldsBut(["Opt in corp watch"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("additional signer", async () => {
          fillAllFieldsBut(["Additional signer"]);
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("Opt in corp watch", async () => {
          fillAllFieldsBut(["Opt in corp watch"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
        });

        it("Certificate of standing", async () => {
          fillAllFieldsBut(["Certificate of standing"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          expect(userDataWasNotUpdated()).toEqual(false);
          expect(subject.getByText("$150.00")).toBeInTheDocument();
        });

        it("Certified copy of formation document", async () => {
          fillAllFieldsBut(["Certified copy of formation document"], { agentRadio: "MANUAL_ENTRY" });
          await clickSubmit();
          await waitFor(() => expect(subject.getByText("$175.00")).toBeInTheDocument());
          expect(userDataWasNotUpdated()).toEqual(false);
        });
      });
    });
  });

  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
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

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const clickSubmit = async (): Promise<void> => {
    fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const fillAllFieldsBut = (
    fieldLabels: string[],
    other: { agentRadio: "NUMBER" | "MANUAL_ENTRY" } = { agentRadio: "NUMBER" }
  ) => {
    if (!fieldLabels.includes("Business suffix")) {
      selectByText("Business suffix", "LLC");
    }
    if (!fieldLabels.includes("Business address line1")) {
      fillText("Business address line1", "1234 main street");
    }
    if (!fieldLabels.includes("Business address line2")) {
      fillText("Business address line2", "Suite 304");
    }
    if (!fieldLabels.includes("Business address zip code")) {
      fillText("Business address zip code", "12345");
    }
    if (!fieldLabels.includes("Signer")) {
      fillText("Signer", "Elrond");
    }
    if (!fieldLabels.includes("Additional signer")) {
      fireEvent.click(subject.getByText(BusinessFormationDefaults.addNewSignerButtonText, { exact: false }));
      fillText("Additional signer 0", "Red Skull");
    }
    if (!fieldLabels.includes("Payment type")) {
      selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
    }
    if (!fieldLabels.includes("Opt in annual report")) {
      selectCheckBox("annual report");
    }
    if (!fieldLabels.includes("Opt in corp watch")) {
      selectCheckBox("corp watch");
    }
    if (!fieldLabels.includes("Certificate of standing")) {
      selectCheckBox("certificate of standing");
    }
    if (!fieldLabels.includes("Certified copy of formation document")) {
      selectCheckBox("certified copy of formation document");
    }

    if (other.agentRadio === "NUMBER") {
      if (!fieldLabels.includes("Agent number")) {
        fillText("Agent number", "1234567890");
      }
    } else {
      chooseRadio("registered-agent-manual");

      if (!fieldLabels.includes("Agent name")) {
        fillText("Agent name", "Hugo Weaving");
      }
      if (!fieldLabels.includes("Agent email")) {
        fillText("Agent email", "name@example.com");
      }
      if (!fieldLabels.includes("Agent office address line1")) {
        fillText("Agent office address line1", "400 Pennsylvania Ave");
      }
      if (!fieldLabels.includes("Agent office address line2")) {
        fillText("Agent office address line2", "Suite 101");
      }
      if (!fieldLabels.includes("Agent office address city")) {
        fillText("Agent office address city", "Newark");
      }
      if (!fieldLabels.includes("Agent office address zip code")) {
        fillText("Agent office address zip code", "45678");
      }
    }
  };
});
