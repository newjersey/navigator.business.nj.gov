import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import {
  CannabisApplyForLicenseDisplayContent,
  createEmptyCannabisApplyForLicenseDisplayContent,
  Task,
} from "@/lib/types/types";
import { generateTask, generateTaskLink, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderPage = (
  task: Task,
  initialUserData?: UserData,
  displayContent?: CannabisApplyForLicenseDisplayContent
) => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
        <CannabisApplyForLicenseTask
          task={task}
          displayContent={displayContent || createEmptyCannabisApplyForLicenseDisplayContent()}
        />
      </WithStatefulUserData>,
      IsAuthenticated.TRUE
    )
  );
};

const sbePriorityStatus = priorityTypesObj.socialEquity[0];
const vetPriorityStatus = priorityTypesObj.veteran[0];
const impactPriorityStatus = priorityTypesObj.impactZone[0];
const minorityWomanPriorityStatus = priorityTypesObj.minorityOrWomen[0];

describe("<CannabisApplyForLicenseTask />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  it("renders application questions tab with unlocked-by alert", async () => {
    const task = generateTask({
      name: "Header",
      unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
    });
    useMockRoadmapTask(task);

    renderPage(task);
    expect(screen.getByText("Header")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Do this first")).toBeInTheDocument();
    });
    expect(screen.getByText(Config.cannabisApplyForLicense.priorityStatusHeader)).toBeInTheDocument();
    expect(screen.getByText(Config.cannabisApplyForLicense.businessSizeHeader)).toBeInTheDocument();
  });

  it("save microbusiness selection to userData", () => {
    const initialUserData = generateUserData({});
    renderPage(generateTask({}), initialUserData);
    fireEvent.click(screen.getByTestId("microbusiness-radio-true"));
    expect(currentUserData().profileData.cannabisMicrobusiness).toEqual(true);

    fireEvent.click(screen.getByTestId("microbusiness-radio-false"));
    expect(currentUserData().profileData.cannabisMicrobusiness).toEqual(false);
  });

  it("does not display Priority Status checkboxes if none checked", () => {
    const initialUserData = generateUserData({ taskItemChecklist: {} });
    renderPage(generateTask({}), initialUserData);
    expect(screen.queryByTestId("Diversely-Owned Business")).not.toBeInTheDocument();
    expect(screen.queryByTestId("Impact Zone Business")).not.toBeInTheDocument();
    expect(screen.queryByTestId("Social Equity Business (SEB)")).not.toBeInTheDocument();
  });

  it("checks diversely-owned if user is minority/woman", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [minorityWomanPriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Diversely-Owned Business")).toBeChecked();
    expect(getInputByName("Impact Zone Business")).not.toBeChecked();
    expect(getInputByName("Social Equity Business (SEB)")).not.toBeChecked();
  });

  it("checks diversely-owned if user is veteran", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [vetPriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Diversely-Owned Business").checked).toEqual(true);
    expect(getInputByName("Impact Zone Business").checked).toEqual(false);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
  });

  it("checks impact-zone if user has impact-zone priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [impactPriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Diversely-Owned Business").checked).toEqual(false);
    expect(getInputByName("Impact Zone Business").checked).toEqual(true);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
  });

  it("checks sbe if user has sbe priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [sbePriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Diversely-Owned Business").checked).toEqual(false);
    expect(getInputByName("Impact Zone Business").checked).toEqual(false);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(true);
  });

  it("checks all priority status that apply", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
        [vetPriorityStatus]: true,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Diversely-Owned Business").checked).toEqual(true);
    expect(getInputByName("Impact Zone Business").checked).toEqual(false);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(true);
  });

  it("lets user uncheck an checked priority status", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(true);
    fireEvent.click(getInputByName("Social Equity Business (SEB)"));
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
  });

  it("shows modal when user checks an unchecked priority status", async () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
    fireEvent.click(getInputByName("Social Equity Business (SEB)"));
    expect(screen.getByText(Config.cannabisApplyForLicense.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.eligibleModalContinueButton));
    await waitFor(() => {
      expect(screen.queryByText(Config.cannabisApplyForLicense.eligibleModalTitle)).not.toBeInTheDocument();
    });
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(true);
  });

  it("keeps item unchecked when user cancels from modal", async () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
    fireEvent.click(getInputByName("Social Equity Business (SEB)"));
    expect(screen.getByText(Config.cannabisApplyForLicense.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.eligibleModalCancelButton));
    await waitFor(() => {
      expect(screen.queryByText(Config.cannabisApplyForLicense.eligibleModalTitle)).not.toBeInTheDocument();
    });
    expect(getInputByName("Social Equity Business (SEB)").checked).toEqual(false);
  });

  describe("requirements tab", () => {
    const displayContent = {
      annualGeneralRequirements: { contentMd: "annualGeneralRequirements-content" },
      conditionalGeneralRequirements: { contentMd: "conditionalGeneralRequirements-content" },
      diverselyOwnedRequirements: { contentMd: "diverselyOwnedRequirements-content" },
      impactZoneRequirements: { contentMd: "impactZoneRequirements-content" },
      microbusinessRequirements: { contentMd: "microbusinessRequirements-content" },
      socialEquityRequirements: { contentMd: "socialEquityRequirements-content" },
      conditionalBottomOfTask: { contentMd: "conditionalBottomOfTask-content" },
      annualBottomOfTask: { contentMd: "annualBottomOfTask-content" },
    };

    it("does not show unlocked-by alert on requirements tab", async () => {
      const initialUserData = generateUserData({
        taskProgress: {
          "annual-license-cannabis": "NOT_STARTED",
        },
      });
      const task = generateTask({
        id: "annual-license-cannabis",
        name: "Header",
        unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
      });

      renderPage(task, initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen).not.toContain("Do this first");
    });

    it("updates taskProgress to from not_started to in-progress when View Requirements is clicked", () => {
      const initialUserData = generateUserData({
        taskProgress: {
          "annual-license-cannabis": "NOT_STARTED",
        },
      });
      renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(currentUserData().taskProgress).toEqual({
        "annual-license-cannabis": "IN_PROGRESS",
      });
    });

    it("does not update taskProgress when already completed", () => {
      const initialUserData = generateUserData({
        taskProgress: {
          "annual-license-cannabis": "COMPLETED",
        },
      });
      renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });

    it("shows annual requirements for annual license", () => {
      renderPage(generateTask({ id: "annual-license-cannabis" }), generateUserData({}), displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen.getByText(displayContent.annualGeneralRequirements.contentMd)).toBeInTheDocument();
      expect(
        screen.queryByText(displayContent.conditionalGeneralRequirements.contentMd)
      ).not.toBeInTheDocument();
    });

    it("shows conditional requirements for conditional license", () => {
      renderPage(generateTask({ id: "conditional-permit-cannabis" }), generateUserData({}), displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen.queryByText(displayContent.annualGeneralRequirements.contentMd)).not.toBeInTheDocument();
      expect(screen.getByText(displayContent.conditionalGeneralRequirements.contentMd)).toBeInTheDocument();
    });

    it("shows requirements for microbusiness", () => {
      renderPage(generateTask({}), generateUserData({}), displayContent);
      fireEvent.click(screen.getByTestId("microbusiness-radio-true"));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(
        screen.getByText(Config.cannabisApplyForLicense.microbusinessApplicationNeeds)
      ).toBeInTheDocument();
      expect(screen.getByText(displayContent.microbusinessRequirements.contentMd)).toBeInTheDocument();
    });

    it("does not show requirements for microbusiness when standard is selected", () => {
      renderPage(generateTask({}), generateUserData({}), displayContent);
      fireEvent.click(screen.getByTestId("microbusiness-radio-false"));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(
        screen.queryByText(Config.cannabisApplyForLicense.microbusinessApplicationNeeds)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(displayContent.microbusinessRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for diversely-owned when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [minorityWomanPriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.getByText(displayContent.diverselyOwnedRequirements.contentMd)).toBeInTheDocument();
      expect(screen.queryByText(displayContent.socialEquityRequirements.contentMd)).not.toBeInTheDocument();
      expect(screen.queryByText(displayContent.impactZoneRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for SBE when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [sbePriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.queryByText(displayContent.diverselyOwnedRequirements.contentMd)).not.toBeInTheDocument();
      expect(screen.getByText(displayContent.socialEquityRequirements.contentMd)).toBeInTheDocument();
      expect(screen.queryByText(displayContent.impactZoneRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for impact zone when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [impactPriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.queryByText(displayContent.diverselyOwnedRequirements.contentMd)).not.toBeInTheDocument();
      expect(screen.queryByText(displayContent.socialEquityRequirements.contentMd)).not.toBeInTheDocument();
      expect(screen.getByText(displayContent.impactZoneRequirements.contentMd)).toBeInTheDocument();
    });

    it("shows CTA for task", () => {
      renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.getByText("do the application here")).toBeInTheDocument();
    });

    it("can go back to first tab", () => {
      renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.backToFirstTabButton));
      expect(screen.getByText(Config.cannabisApplyForLicense.applicationQuestionsText)).toBeInTheDocument();
    });
  });

  const getInputByName = (name: string): HTMLInputElement => {
    return screen.getByRole("checkbox", { name: name });
  };
});
