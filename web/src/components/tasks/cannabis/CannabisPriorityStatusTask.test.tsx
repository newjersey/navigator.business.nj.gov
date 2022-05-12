import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { CannabisPriorityStatusDisplayContent, Task } from "@/lib/types/types";
import {
  generateCannabisPriorityStatusDisplayContent,
  generateTask,
  generateTaskLink,
  generateUserData,
} from "@/test/factories";
import { randomElementFromArray, withAuthAlert } from "@/test/helpers";
import { useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderPage = (
  task: Task,
  initialUserData?: UserData,
  displayContent?: CannabisPriorityStatusDisplayContent
) => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
        <CannabisPriorityStatusTask
          task={task}
          displayContent={generateCannabisPriorityStatusDisplayContent(displayContent ? displayContent : {})}
        />
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
      contentMd: "Content",
      unlockedBy: [generateTaskLink({ name: "Do this first", urlSlug: "do-this-first" })],
    });
    useMockRoadmapTask(task);

    renderPage(task);
    expect(screen.getByText("Header")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Do this first")).toBeInTheDocument();
    });
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders requirements button when checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray([
      ...allPriorityTypes,
      noneOfTheAbovePriorityId,
    ]) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}Content`,
    });
    useMockRoadmapTask(task);
    renderPage(task);

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(screen.queryByTestId("nextTabButton")).not.toBeInTheDocument();
  });

  it("unselects all priority types when none of the above checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);
    renderPage(task);

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("none-of-the-above"));
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
  });

  it("deselect none of the above checkbox when a priority type is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getByTestId("none-of-the-above"));
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(false);
    expect(screen.getByTestId("nextTabButton")).toBeInTheDocument();
  });

  it("updates task progress from not started to in progress when user navigates to the second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityId]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(within(screen.getByTestId("taskProgress")).getByTestId("IN_PROGRESS")).toBeInTheDocument();
    });
    expect(screen.getByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
  });

  it("navigates to and from second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityId]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
      contentMd: `Content\n- []{${noneOfTheAbovePriorityId}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
    expect(screen.getByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
  });

  it("displays complete button when impact zone priority type is the only type selected", async () => {
    const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomImpactZonePriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
      contentMd: `Content\n- []{${randomImpactZonePriorityType}}}Random Priority Type Checkbox\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
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
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
      contentMd: `Content\n- []{${randomVeteranPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
      contentMd: `Content\n- []{${randomMinorityOrWomentPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
      contentMd: `Content\n- []{${randomMinorityOrWomentPriorityType}}}Random Priority Type Checkbox\n- []{${randomVeteranPriorityType}}}Random Priority Type Checkbox\n- []{${randomSocialEquityPriorityType}}}Random Priority Type Checkbox\n- []{${randomImpactZonePriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    renderPage(task);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    fireEvent.click(screen.getAllByRole("checkbox")[2]);
    fireEvent.click(screen.getAllByRole("checkbox")[3]);
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
});
