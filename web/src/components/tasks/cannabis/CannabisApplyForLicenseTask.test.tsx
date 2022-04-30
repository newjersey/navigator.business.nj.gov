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
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderPage = (
  task: Task,
  initialUserData?: UserData,
  displayContent?: CannabisApplyForLicenseDisplayContent
): RenderResult => {
  return render(
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
  let subject: RenderResult;

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

    subject = renderPage(task);
    expect(subject.getByText("Header")).toBeInTheDocument();
    await waitFor(() => {
      expect(subject.getByText("Do this first")).toBeInTheDocument();
    });
    expect(subject.getByText(Config.cannabisApplyForLicense.priorityStatusHeader)).toBeInTheDocument();
    expect(subject.getByText(Config.cannabisApplyForLicense.businessSizeHeader)).toBeInTheDocument();
  });

  it("save microbusiness selection to userData", () => {
    const initialUserData = generateUserData({});
    subject = renderPage(generateTask({}), initialUserData);
    fireEvent.click(subject.getByTestId("microbusiness-radio-true"));
    expect(currentUserData().profileData.cannabisMicrobusiness).toEqual(true);

    fireEvent.click(subject.getByTestId("microbusiness-radio-false"));
    expect(currentUserData().profileData.cannabisMicrobusiness).toEqual(false);
  });

  it("does not display Priority Status checkboxes if none checked", () => {
    const initialUserData = generateUserData({ taskItemChecklist: {} });
    subject = renderPage(generateTask({}), initialUserData);
    expect(subject.queryByTestId("diversely-owned-checkbox")).not.toBeInTheDocument();
    expect(subject.queryByTestId("impact-zone-checkbox")).not.toBeInTheDocument();
    expect(subject.queryByTestId("sbe-checkbox")).not.toBeInTheDocument();
  });

  it("checks diversely-owned if user is minority/woman", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [minorityWomanPriorityStatus]: true },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("diversely-owned-checkbox").checked).toEqual(true);
    expect(getInputByTestId("impact-zone-checkbox").checked).toEqual(false);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
  });

  it("checks diversely-owned if user is veteran", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [vetPriorityStatus]: true },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("diversely-owned-checkbox").checked).toEqual(true);
    expect(getInputByTestId("impact-zone-checkbox").checked).toEqual(false);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
  });

  it("checks impact-zone if user has impact-zone priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [impactPriorityStatus]: true },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("diversely-owned-checkbox").checked).toEqual(false);
    expect(getInputByTestId("impact-zone-checkbox").checked).toEqual(true);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
  });

  it("checks sbe if user has sbe priority", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: { [sbePriorityStatus]: true },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("diversely-owned-checkbox").checked).toEqual(false);
    expect(getInputByTestId("impact-zone-checkbox").checked).toEqual(false);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(true);
  });

  it("checks all priority status that apply", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
        [vetPriorityStatus]: true,
      },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("diversely-owned-checkbox").checked).toEqual(true);
    expect(getInputByTestId("impact-zone-checkbox").checked).toEqual(false);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(true);
  });

  it("lets user uncheck an checked priority status", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [sbePriorityStatus]: true,
      },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(true);
    fireEvent.click(getInputByTestId("sbe-checkbox"));
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
  });

  it("shows modal when user checks an unchecked priority status", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
    fireEvent.click(getInputByTestId("sbe-checkbox"));
    expect(subject.getByText(Config.cannabisApplyForLicense.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.eligibleModalContinueButton));
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(true);
  });

  it("keeps item unchecked when user cancels from modal", () => {
    const initialUserData = generateUserData({
      taskItemChecklist: {
        [minorityWomanPriorityStatus]: true,
        [sbePriorityStatus]: false,
      },
    });
    subject = renderPage(generateTask({}), initialUserData);
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
    fireEvent.click(getInputByTestId("sbe-checkbox"));
    expect(subject.getByText(Config.cannabisApplyForLicense.eligibleModalTitle)).toBeInTheDocument();
    fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.eligibleModalCancelButton));
    expect(getInputByTestId("sbe-checkbox").checked).toEqual(false);
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

    it("updates taskProgress to from not_started to in-progress when View Requirements is clicked", () => {
      const initialUserData = generateUserData({
        taskProgress: {
          "annual-license-cannabis": "NOT_STARTED",
        },
      });
      subject = renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData, displayContent);
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
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
      subject = renderPage(generateTask({ id: "annual-license-cannabis" }), initialUserData, displayContent);
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });

    it("shows annual requirements for annual license", () => {
      subject = renderPage(
        generateTask({ id: "annual-license-cannabis" }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(subject.queryByText(displayContent.annualGeneralRequirements.contentMd)).toBeInTheDocument();
      expect(
        subject.queryByText(displayContent.conditionalGeneralRequirements.contentMd)
      ).not.toBeInTheDocument();
    });

    it("shows conditional requirements for conditional license", () => {
      subject = renderPage(
        generateTask({ id: "conditional-permit-cannabis" }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(subject.queryByText(displayContent.annualGeneralRequirements.contentMd)).not.toBeInTheDocument();
      expect(
        subject.queryByText(displayContent.conditionalGeneralRequirements.contentMd)
      ).toBeInTheDocument();
    });

    it("shows requirements for microbusiness", () => {
      subject = renderPage(generateTask({}), generateUserData({}), displayContent);
      fireEvent.click(subject.getByTestId("microbusiness-radio-true"));
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(
        subject.queryByText(Config.cannabisApplyForLicense.microbusinessApplicationNeeds)
      ).toBeInTheDocument();
      expect(subject.queryByText(displayContent.microbusinessRequirements.contentMd)).toBeInTheDocument();
    });

    it("does not show requirements for microbusiness when standard is selected", () => {
      subject = renderPage(generateTask({}), generateUserData({}), displayContent);
      fireEvent.click(subject.getByTestId("microbusiness-radio-false"));
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      expect(
        subject.queryByText(Config.cannabisApplyForLicense.microbusinessApplicationNeeds)
      ).not.toBeInTheDocument();
      expect(subject.queryByText(displayContent.microbusinessRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for diversely-owned when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [minorityWomanPriorityStatus]: true },
      });
      subject = renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(subject.queryByText(displayContent.diverselyOwnedRequirements.contentMd)).toBeInTheDocument();
      expect(subject.queryByText(displayContent.socialEquityRequirements.contentMd)).not.toBeInTheDocument();
      expect(subject.queryByText(displayContent.impactZoneRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for SBE when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [sbePriorityStatus]: true },
      });
      subject = renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(
        subject.queryByText(displayContent.diverselyOwnedRequirements.contentMd)
      ).not.toBeInTheDocument();
      expect(subject.queryByText(displayContent.socialEquityRequirements.contentMd)).toBeInTheDocument();
      expect(subject.queryByText(displayContent.impactZoneRequirements.contentMd)).not.toBeInTheDocument();
    });

    it("shows requirements for impact zone when checkbox is checked", () => {
      const initialUserData = generateUserData({
        taskItemChecklist: { [impactPriorityStatus]: true },
      });
      subject = renderPage(generateTask({}), initialUserData, displayContent);
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(
        subject.queryByText(displayContent.diverselyOwnedRequirements.contentMd)
      ).not.toBeInTheDocument();
      expect(subject.queryByText(displayContent.socialEquityRequirements.contentMd)).not.toBeInTheDocument();
      expect(subject.queryByText(displayContent.impactZoneRequirements.contentMd)).toBeInTheDocument();
    });

    it("shows CTA for task", () => {
      subject = renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));

      expect(subject.queryByText("do the application here")).toBeInTheDocument();
    });

    it("can go back to first tab", () => {
      subject = renderPage(
        generateTask({
          callToActionText: "do the application here",
        }),
        generateUserData({}),
        displayContent
      );
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.viewRequirementsButton));
      fireEvent.click(subject.getByText(Config.cannabisApplyForLicense.backToFirstTabButton));
      expect(
        subject.queryByText(Config.cannabisApplyForLicense.applicationQuestionsText)
      ).toBeInTheDocument();
    });
  });

  const getInputByTestId = (testId: string): HTMLInputElement => {
    return subject.container.querySelector(`[data-testid="${testId}"] input`) as HTMLInputElement;
  };
});
