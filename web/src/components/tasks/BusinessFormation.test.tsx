import { BusinessFormation } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { createEmptyFormationDisplayContent, FormationDisplayContent } from "@/lib/types/types";
import {
  generateFormationDisplayContent,
  generateMunicipality,
  generateProfileData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { LookupLegalStructureById, ProfileData, UserData } from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<BusinessFormation />", () => {
  let subject: RenderResult;
  const task = generateTask({});

  const renderTask = (
    userData: Partial<UserData>,
    overrideDispayContent?: FormationDisplayContent
  ): RenderResult => {
    return render(
      <WithStatefulUserData initialUserData={generateUserData(userData)}>
        <ThemeProvider theme={createTheme()}>
          <BusinessFormation
            task={task}
            displayContent={
              overrideDispayContent ? overrideDispayContent : createEmptyFormationDisplayContent()
            }
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
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

    it("updates userData when business formation data is submitted", () => {
      const profileData = generateLLCProfileData({});
      const displayContent = generateFormationDisplayContent({
        optInAnnualReport: { contentMd: "annual report" },
        optInCorpWatch: { contentMd: "corp watch" },
      });

      subject = renderTask({ profileData }, displayContent);

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

      selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
      selectCheckBox("annual report");
      selectCheckBox("corp watch");

      fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));

      expect(currentUserData().formationData?.businessSuffix).toEqual("LLC");
      expect(currentUserData().formationData?.businessStartDate).toEqual(
        threeDaysFromNow.format("YYYY-MM-DD")
      );
      expect(currentUserData().formationData?.businessAddressLine1).toEqual("1234 main street");
      expect(currentUserData().formationData?.businessAddressLine2).toEqual("Suite 304");
      expect(currentUserData().formationData?.businessAddressState).toEqual("NJ");
      expect(currentUserData().formationData?.businessAddressZipCode).toEqual("12345");
      expect(currentUserData().formationData?.agentNumberOrManual).toEqual("MANUAL_ENTRY");
      expect(currentUserData().formationData?.agentNumber).toEqual("");
      expect(currentUserData().formationData?.agentName).toEqual("Hugo Weaving");
      expect(currentUserData().formationData?.agentEmail).toEqual("name@example.com");
      expect(currentUserData().formationData?.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
      expect(currentUserData().formationData?.agentOfficeAddressLine2).toEqual("Suite 101");
      expect(currentUserData().formationData?.agentOfficeAddressCity).toEqual("Newark");
      expect(currentUserData().formationData?.agentOfficeAddressState).toEqual("NJ");
      expect(currentUserData().formationData?.agentOfficeAddressZipCode).toEqual("45678");
      expect(currentUserData().formationData?.paymentType).toEqual("CC");
      expect(currentUserData().formationData?.annualReportNotification).toEqual(true);
      expect(currentUserData().formationData?.corpWatchNotification).toEqual(true);
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

    describe("required fields", () => {
      beforeEach(() => {
        const profileData = generateLLCProfileData({});
        const displayContent = generateFormationDisplayContent({
          optInAnnualReport: { contentMd: "annual report" },
          optInCorpWatch: { contentMd: "corp watch" },
        });
        subject = renderTask({ profileData }, displayContent);
      });

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
        if (!fieldLabels.includes("Payment type")) {
          selectByText("Payment Type", BusinessFormationDefaults.creditCardPaymentTypeLabel);
        }
        if (!fieldLabels.includes("Opt in annual report")) {
          selectCheckBox("annual report");
        }
        if (!fieldLabels.includes("Opt in corp watch")) {
          selectCheckBox("corp watch");
        }
      };

      describe("does not submit when missing a required field", () => {
        it("Business suffix", () => {
          fillAllFieldsBut(["Business suffix"]);
          fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address line1", () => {
          fillAllFieldsBut(["Business address line1"]);
          fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        it("Business address zip code", () => {
          fillAllFieldsBut(["Business address zip code"]);
          fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        describe("when agent number selected", () => {
          it("agent number", () => {
            fillAllFieldsBut(["Agent number"], { agentRadio: "NUMBER" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        describe("when agent manual selected", () => {
          it("agent name", () => {
            fillAllFieldsBut(["Agent name"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent email", () => {
            fillAllFieldsBut(["Agent email"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("agent address line 1", () => {
            fillAllFieldsBut(["Agent office address line1"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address city", () => {
            fillAllFieldsBut(["Agent office address line1", "Agent office address city"], {
              agentRadio: "MANUAL_ENTRY",
            });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });

          it("Agent office address zip code", () => {
            fillAllFieldsBut(["Agent office address zip code"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        it("Payment type", () => {
          fillAllFieldsBut(["Payment type"]);
          fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
          expect(userDataWasNotUpdated()).toEqual(true);
        });

        describe("submits when missing optional field", () => {
          it("everything present", () => {
            fillAllFieldsBut([]);
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(false);
          });

          it("agent address line 2", () => {
            fillAllFieldsBut(["Agent office address line2"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(false);
          });

          it("business address line 2", () => {
            fillAllFieldsBut(["Business address line2"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(false);
          });

          it("Opt in annual report", () => {
            fillAllFieldsBut(["Opt in annual report"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(false);
          });

          it("Opt in corp watch", () => {
            fillAllFieldsBut(["Opt in corp watch"], { agentRadio: "MANUAL_ENTRY" });
            fireEvent.click(subject.getByText(BusinessFormationDefaults.submitButtonText));
            expect(userDataWasNotUpdated()).toEqual(false);
          });
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
});
