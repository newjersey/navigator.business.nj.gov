import { CannabisPriorityStatus, priorityTypesObj } from "@/components/tasks/CannabisPriorityStatus";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
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
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderPage = (
  task: Task,
  initialUserData?: UserData,
  displayContent?: CannabisPriorityStatusDisplayContent
): RenderResult => {
  return render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
        <CannabisPriorityStatus
          task={task}
          displayContent={generateCannabisPriorityStatusDisplayContent(displayContent ? displayContent : {})}
        />
      </WithStatefulUserData>,
      IsAuthenticated.TRUE
    )
  );
};

describe("<CannabisPriorityStatus />", () => {
  let subject: RenderResult;
  const allPriorityTypes = [
    ...priorityTypesObj.minorityOrWomen,
    ...priorityTypesObj.veteran,
    ...priorityTypesObj.impactZone,
    ...priorityTypesObj.socialEquity,
  ];
  const noneOfTheAbovePriorityType = priorityTypesObj.noneOfTheAbove;

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

    subject = renderPage(task);
    expect(subject.getByText("Header")).toBeInTheDocument();
    await waitFor(() => {
      expect(subject.getByText("Do this first")).toBeInTheDocument();
    });
    expect(subject.getByText("Content")).toBeInTheDocument();
  });

  it("renders requirements button when checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray([
      ...allPriorityTypes,
      noneOfTheAbovePriorityType,
    ]) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}Content`,
    });
    useMockRoadmapTask(task);
    subject = renderPage(task);

    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(subject.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
  });

  it("unselects all priority types when none of the above checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);
    subject = renderPage(task);

    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(subject.getByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(subject.getByTestId("none-of-the-above"));
    expect(subject.queryByTestId("nextTabButton")).toBeInTheDocument();
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityType]).toBe(true);
  });

  it("deselect none of the above checkbox when a priority type is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getByTestId("none-of-the-above"));
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityType]).toBe(true);
    expect(subject.queryByTestId("nextTabButton")).toBeInTheDocument();

    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    expect(currentUserData().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(currentUserData().taskItemChecklist[noneOfTheAbovePriorityType]).toBe(false);
    expect(subject.queryByTestId("nextTabButton")).toBeInTheDocument();
  });

  it("updates task progress from not started to in progress when user navigates to the second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityType]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(within(subject.getByTestId("taskProgress")).getByTestId("IN_PROGRESS")).toBeInTheDocument();
      expect(subject.getByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
    });
  });

  it("navigates to and from second tab", async () => {
    const randomPriorityType = randomElementFromArray([...allPriorityTypes, noneOfTheAbovePriorityType]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    });

    fireEvent.click(subject.getByTestId("backButton"));
    expect(subject.getByTestId("nextTabButton")).toBeInTheDocument();
    expect(subject.queryByTestId("backButton")).not.toBeInTheDocument();
  });

  it("selects no priority status checkbox and clicks complete task button", async () => {
    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${noneOfTheAbovePriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.noPriorityStatusText)).toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.getByTestId("completeTaskProgressButton")).toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("certificationButton")).not.toBeInTheDocument();
    });

    fireEvent.click(subject.getByTestId("completeTaskProgressButton"));
    await waitFor(() => {
      expect(within(subject.getByTestId("taskProgress")).getByTestId("COMPLETED")).toBeInTheDocument();
      expect(subject.getByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
    });
  });

  it("displays complete button when impact zone priority type is the only type selected", async () => {
    const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomImpactZonePriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
      expect(subject.getByTestId("completeTaskProgressButton")).toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("certificationButton")).not.toBeInTheDocument();
    });
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

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getAllByRole("checkbox")[1]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
      expect(subject.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
    });
  });

  it("displays social equity content and cta when social equity checkbox is selected", async () => {
    const randomSocialEquityPriorityType = randomElementFromArray(priorityTypesObj.socialEquity);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomSocialEquityPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.socialEquityHeaderText)).toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).toBeInTheDocument();
      expect(subject.queryByTestId("certificationButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
      ).not.toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).not.toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)).toBeInTheDocument();
    });
  });

  it("displays veterans content and cta when veteran checkbox is selected", async () => {
    const randomVeteranPriorityType = randomElementFromArray([...priorityTypesObj.veteran]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomVeteranPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.veteranHeaderText)).toBeInTheDocument();
      expect(subject.queryByTestId("certificationButton")).toBeInTheDocument();
      expect(subject.queryByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
      ).not.toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)
      ).not.toBeInTheDocument();
    });
  });

  it("displays minority/women content and cta when minority/women checkbox is selected", async () => {
    const randomMinorityOrWomentPriorityType = randomElementFromArray([...priorityTypesObj.minorityOrWomen]);

    const task = generateTask({
      id: "123",
      name: "Header",
      contentMd: `Content\n- []{${randomMinorityOrWomentPriorityType}}}Random Priority Type Checkbox`,
    });
    useMockRoadmapTask(task);

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.minorityOrWomenHeaderText)).toBeInTheDocument();
      expect(subject.queryByTestId("certificationButton")).toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
      ).toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)
      ).not.toBeInTheDocument();
    });
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

    subject = renderPage(task);
    fireEvent.click(subject.getAllByRole("checkbox")[0]);
    fireEvent.click(subject.getAllByRole("checkbox")[1]);
    fireEvent.click(subject.getAllByRole("checkbox")[2]);
    fireEvent.click(subject.getAllByRole("checkbox")[3]);
    fireEvent.click(subject.getByTestId("nextTabButton"));

    await waitFor(() => {
      expect(subject.getByText(Config.cannabisPriorityStatus.minorityOrWomenHeaderText)).toBeInTheDocument();
      expect(subject.getByText(Config.cannabisPriorityStatus.veteranHeaderText)).toBeInTheDocument();
      expect(subject.getByText(Config.cannabisPriorityStatus.impactZoneHeaderText)).toBeInTheDocument();
      expect(subject.getByText(Config.cannabisPriorityStatus.socialEquityHeaderText)).toBeInTheDocument();

      expect(subject.queryByTestId("certificationButton")).toBeInTheDocument();
      expect(subject.getByTestId("backButton")).toBeInTheDocument();
      expect(subject.queryByTestId("socialEquityButton")).toBeInTheDocument();
      expect(subject.queryByTestId("nextTabButton")).not.toBeInTheDocument();
      expect(subject.queryByTestId("completeTaskProgressButton")).not.toBeInTheDocument();
      expect(
        subject.queryByText(Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText)
      ).toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxVeteranText)).toBeInTheDocument();
      expect(subject.queryByText(Config.cannabisPriorityStatus.greenBoxSocialEquityText)).toBeInTheDocument();
    });
  });
});
