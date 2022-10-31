import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import { generateTask, generateTaskLink, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});

const renderPage = (task: Task, initialUserData?: UserData) => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
        <CannabisApplyForLicenseTask task={task} />
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
    expect(diverselyOwnedCheckbox()).toBeChecked();
    expect(impactZoneCheckbox()).not.toBeChecked();
    expect(sbeCheckbox()).not.toBeChecked();
  });

  it("checks diversely-owned if user is veteran", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [vetPriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(diverselyOwnedCheckbox().checked).toEqual(true);
    expect(impactZoneCheckbox().checked).toEqual(false);
    expect(sbeCheckbox().checked).toEqual(false);
  });

  it("checks impact-zone if user has impact-zone priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [impactPriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(diverselyOwnedCheckbox().checked).toEqual(false);
    expect(impactZoneCheckbox().checked).toEqual(true);
    expect(sbeCheckbox().checked).toEqual(false);
  });

  it("checks sbe if user has sbe priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [sbePriorityStatus]: true },
    });
    renderPage(generateTask({}), initialUserData);
    expect(diverselyOwnedCheckbox().checked).toEqual(false);
    expect(impactZoneCheckbox().checked).toEqual(false);
    expect(sbeCheckbox().checked).toEqual(true);
  });

  it("checks all priority status that apply", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
        [vetPriorityStatus]: true,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(diverselyOwnedCheckbox().checked).toEqual(true);
    expect(impactZoneCheckbox().checked).toEqual(false);
    expect(sbeCheckbox().checked).toEqual(true);
  });

  it("lets user uncheck an checked priority status", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(sbeCheckbox().checked).toEqual(true);
    fireEvent.click(sbeCheckbox());
    expect(sbeCheckbox().checked).toEqual(false);
  });

  it("shows modal when user checks an unchecked priority status", async () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(sbeCheckbox().checked).toEqual(false);
    fireEvent.click(sbeCheckbox());
    expect(screen.getByText(Config.cannabisEligibilityModal.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.cannabisEligibilityModal.eligibleModalContinueButton));
    await waitFor(() => {
      expect(screen.queryByText(Config.cannabisEligibilityModal.eligibleModalTitle)).not.toBeInTheDocument();
    });
    expect(sbeCheckbox().checked).toEqual(true);
  });

  it("keeps item unchecked when user cancels from modal", async () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    renderPage(generateTask({}), initialUserData);
    expect(sbeCheckbox().checked).toEqual(false);
    fireEvent.click(sbeCheckbox());
    expect(screen.getByText(Config.cannabisEligibilityModal.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.cannabisEligibilityModal.eligibleModalCancelButton));
    await waitFor(() => {
      expect(screen.queryByText(Config.cannabisEligibilityModal.eligibleModalTitle)).not.toBeInTheDocument();
    });
    expect(sbeCheckbox().checked).toEqual(false);
  });

  describe("requirements tab", () => {
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

      renderPage(task, initialUserData);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen).not.toContain("Do this first");
    });

    it("updates taskProgress to from not_started to in-progress when View Requirements is clicked", () => {
      const initialUserData = generateUserData({
        taskProgress: {
          "annual-license-cannabis": "NOT_STARTED",
        },
      });
      renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData);
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
      renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });

    it("shows annual requirements for annual license", () => {
      renderPage(generateTask({ id: "annual-license-cannabis" }), generateUserData({}));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen.getByTestId("annualGeneralRequirements")).toBeInTheDocument();
      expect(screen.queryByTestId("conditionalGeneralRequirements")).not.toBeInTheDocument();
    });

    it("shows conditional requirements for conditional license", () => {
      renderPage(generateTask({ id: "conditional-permit-cannabis" }), generateUserData({}));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen.queryByTestId("annualGeneralRequirements")).not.toBeInTheDocument();
      expect(screen.getByTestId("conditionalGeneralRequirements")).toBeInTheDocument();
    });

    it("shows requirements for microbusiness", () => {
      renderPage(generateTask({}), generateUserData({}));
      fireEvent.click(screen.getByTestId("microbusiness-radio-true"));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.getByTestId("microbusinessRequirements")).toBeInTheDocument();
    });

    it("does not show requirements for microbusiness when standard is selected", () => {
      renderPage(generateTask({}), generateUserData({}));
      fireEvent.click(screen.getByTestId("microbusiness-radio-false"));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(screen.queryByTestId("microbusinessRequirements")).not.toBeInTheDocument();
    });

    it("shows requirements for diversely-owned when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [minorityWomanPriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.getByTestId("diverselyOwnedRequirements")).toBeInTheDocument();
      expect(screen.queryByTestId("socialEquityRequirements")).not.toBeInTheDocument();
      expect(screen.queryByTestId("impactZoneRequirements")).not.toBeInTheDocument();
    });

    it("shows requirements for SBE when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [sbePriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.queryByTestId("diverselyOwnedRequirements")).not.toBeInTheDocument();
      expect(screen.getByTestId("socialEquityRequirements")).toBeInTheDocument();
      expect(screen.queryByTestId("impactZoneRequirements")).not.toBeInTheDocument();
    });

    it("shows requirements for impact zone when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [impactPriorityStatus]: true },
      });
      renderPage(generateTask({}), initialUserData);
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.queryByTestId("diverselyOwnedRequirements")).not.toBeInTheDocument();
      expect(screen.queryByTestId("socialEquityRequirements")).not.toBeInTheDocument();
      expect(screen.getByTestId("impactZoneRequirements")).toBeInTheDocument();
    });

    it("shows CTA for task", () => {
      renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({})
      );
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(screen.getByText("do the application here")).toBeInTheDocument();
    });

    it("can go back to first tab", () => {
      renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({})
      );
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      fireEvent.click(screen.getByText(Config.cannabisApplyForLicense.backToFirstTabButton));
      expect(screen.getByText(Config.cannabisApplyForLicense.applicationQuestionsText)).toBeInTheDocument();
    });
  });

  const getInputByName = (name: string): HTMLInputElement => {
    return screen.getByRole("checkbox", { name: name });
  };

  const sbeCheckbox = () => {
    return getInputByName(Config.cannabisApplyForLicense.sbeLabel);
  };
  const diverselyOwnedCheckbox = () => {
    return getInputByName(Config.cannabisApplyForLicense.diverselyOwnedLabel);
  };
  const impactZoneCheckbox = () => {
    return getInputByName(Config.cannabisApplyForLicense.impactZoneLabel);
  };
});
