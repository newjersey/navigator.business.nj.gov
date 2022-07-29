/* eslint-disable testing-library/no-render-in-setup */

import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask, generateTaskLink, generateUserData } from "@/test/factories";
import { randomElementFromArray, withAuthAlert } from "@/test/helpers";
import { useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

const renderPage = (task: Task, initialUserData?: UserData) => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
        <CannabisPriorityStatusTask task={task} />
      </WithStatefulUserData>,
      IsAuthenticated.TRUE
    )
  );
};

describe("<CannabisPriorityStatusTask />", () => {
  const allPriorityTypes = [
    ...priorityTypesObj.minorityOrWomen,
    ...priorityTypesObj.veteran,
    ...priorityTypesObj.impactZone,
    ...priorityTypesObj.socialEquity,
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  it("renders priority types tab with unlocked by alert", async () => {
    const task = generateTask({
      id: "123",
      name: "Header",
      unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
    });
    useMockRoadmapTask(task);

    renderPage(task);
    expect(screen.getByText("Header")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Do this first")).toBeInTheDocument();
    });
    expect(screen.getByTestId("tab1")).toBeInTheDocument();
  });

  it("renders requirements button when checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray([
      ...allPriorityTypes,
      noneOfTheAbovePriorityId,
    ]) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);
    renderPage(task);

    fireEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
  });

  it("unselects all priority types when none of the above checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);
    renderPage(task);

    fireEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
  });

  it("deselect none of the above checkbox when a priority type is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(false);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();
  });

  it("updates task progress from not started to in progress when user navigates to the second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityId]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(within(screen.getByTestId("taskProgress")).getByTestId("IN_PROGRESS")).toBeInTheDocument();
    });
    expect(screen.getByText(Config.taskDefaults.taskProgressSuccessSnackbarBody)).toBeInTheDocument();
  });

  it("navigates to and from second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityId]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByTestId("backButton")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("backButton"));
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();
    expect(screen.queryByTestId("backButton")).not.toBeInTheDocument();
  });

  it("selects no priority status checkbox and clicks complete task button", async () => {
    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.noPriorityStatusText)).toBeInTheDocument();
    });
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.getByTestId("completeTaskProgressButton")).toBeInTheDocument();
    expect(screen.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("certificationButton")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("completeTaskProgressButton"));
    await waitFor(() => {
      expect(within(screen.getByTestId("taskProgress")).getByTestId("COMPLETED")).toBeInTheDocument();
    });
    expect(screen.getByText(Config.taskDefaults.taskProgressSuccessSnackbarBody)).toBeInTheDocument();
  });

  it("displays complete button when impact zone priority type is the only type selected", async () => {
    const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
    });
    expect(screen.getByTestId("completeTaskProgressButton")).toBeInTheDocument();
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("certificationButton")).not.toBeInTheDocument();
  });

  it("does not display complete button when impact zone and another priority type are selected", async () => {
    const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);
    const randomPriorityType = randomElementFromArray([
      ...priorityTypesObj.veteran,
      ...priorityTypesObj.socialEquity,
      ...priorityTypesObj.minorityOrWomen,
    ]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
    fireEvent.click(screen.getByTestId(randomPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
    });
    expect(screen.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
  });

  it("displays social equity content and cta when social equity checkbox is selected", async () => {
    const randomSocialEquityPriorityType = randomElementFromArray(priorityTypesObj.socialEquity);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomSocialEquityPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.socialEquityHeaderText)).toBeInTheDocument();
    });
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.getByTestId("socialEquityButton")).toBeInTheDocument();
    expect(screen.queryByTestId("certificationButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).not.toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)).toBeInTheDocument();
  });

  it("displays veterans content and cta when veteran checkbox is selected", async () => {
    const randomVeteranPriorityType = randomElementFromArray([...priorityTypesObj.veteran]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomVeteranPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.veteranHeaderText)).toBeInTheDocument();
    });
    expect(screen.getByTestId("certificationButton")).toBeInTheDocument();
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
    ).not.toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).toBeInTheDocument();
    expect(
      screen.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)
    ).not.toBeInTheDocument();
  });

  it("displays minority/women content and cta when minority/women checkbox is selected", async () => {
    const randomMinorityOrWomentPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomMinorityOrWomentPriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.minorityOrWomenHeaderText)).toBeInTheDocument();
    });
    expect(screen.getByTestId("certificationButton")).toBeInTheDocument();
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)).toBeInTheDocument();
    expect(screen.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)
    ).not.toBeInTheDocument();
  });

  it("displays social equity and minority/women checkbox when once checkbox from each priority types is selected", async () => {
    const randomMinorityOrWomentPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);
    const randomVeteranPriorityType = randomElementFromArray([...priorityTypesObj.veteran]);
    const randomSocialEquityPriorityType = randomElementFromArray(priorityTypesObj.socialEquity);
    const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId(randomMinorityOrWomentPriorityType));
    fireEvent.click(screen.getByTestId(randomVeteranPriorityType));
    fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
    fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(screen.getByText(Config.cannabisPriorityStatus.minorityOrWomenHeaderText)).toBeInTheDocument();
    });
    expect(screen.getByText(Config.cannabisPriorityStatus.veteranHeaderText)).toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.socialEquityHeaderText)).toBeInTheDocument();

    expect(screen.getByTestId("certificationButton")).toBeInTheDocument();
    expect(screen.getByTestId("backButton")).toBeInTheDocument();
    expect(screen.getByTestId("socialEquityButton")).toBeInTheDocument();
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)).toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).toBeInTheDocument();
    expect(screen.getByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)).toBeInTheDocument();
  });

  describe("displays eligibility phrases for priority types", () => {
    beforeEach(() => {
      const task = generateTask({});
      useMockRoadmapTask(task);

      renderPage(task);
    });

    it("displays diversely-owned eligibility when minority/women or veteran priority types are selected", () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);
      const randomVeteranType = randomElementFromArray([...priorityTypesObj.veteran]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase1, {
        type1: Config.cannabisPriorityTypes.minorityWomenOrVeteran,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomVeteranType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomVeteranType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });

    it("displays impact zone eligibility when impact zone types are selected", () => {
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase1, {
        type1: Config.cannabisPriorityTypes.impactZone,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });

    it("displays social equity eligibility when social equity types are selected", () => {
      const randomSocialEquityPriorityType = randomElementFromArray([...priorityTypesObj.socialEquity]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase1, {
        type1: Config.cannabisPriorityTypes.socialEquity,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });

    it("displays 2-part eligibility when minority/women AND impact zone are selected", () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase2, {
        type1: Config.cannabisPriorityTypes.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityTypes.impactZone,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });

    it("displays 2-part eligibility when minority/women AND social equity are selected", () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);
      const randomSocialEquityPriorityType = randomElementFromArray([...priorityTypesObj.socialEquity]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase2, {
        type1: Config.cannabisPriorityTypes.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityTypes.socialEquity,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });

    it("displays 3-part eligibility when minority/women, impact zone, AND social equity are selected", () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);
      const randomSocialEquityPriorityType = randomElementFromArray([...priorityTypesObj.socialEquity]);
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(Config.cannabisPriorityStatus.phrase3, {
        type1: Config.cannabisPriorityTypes.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityTypes.impactZone,
        type3: Config.cannabisPriorityTypes.socialEquity,
      });

      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.getByText(eligibilityPhrase)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      expect(screen.queryByText(eligibilityPhrase)).not.toBeInTheDocument();
    });
  });
});
