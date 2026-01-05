/* eslint-disable testing-library/no-render-in-lifecycle */

import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  noneOfTheAbovePriorityId,
  priorityTypesObj,
} from "@/lib/domain-logic/cannabisPriorityTypes";
import { getTaskStatusUpdatedMessage, templateEval } from "@/lib/utils/helpers";
import { generateTask, generateTaskLink } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { findButton } from "@/test/helpers/accessible-queries";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import { generateUserData } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Task } from "@businessnjgovnavigator/shared/types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();
const C = Config.cannabisPriorityStatus;

const renderPage = (task: Task): void => {
  render(
    withNeedsAccountContext(
      <WithStatefulUserData initialUserData={generateUserData({})}>
        <CannabisPriorityStatusTask task={task} />
      </WithStatefulUserData>,
      IsAuthenticated.TRUE,
    ),
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
    // React 19: Use real timers to avoid conflicts with async waitFor in findBy* queries
    jest.useRealTimers();
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

    await userEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentBusiness().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentBusiness().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(screen.queryByRole("button", { name: C.nextButtonText })).not.toBeInTheDocument();
  });

  it("unselects all priority types when none of the above checkbox is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes) as string;

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);
    renderPage(task);

    await userEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentBusiness().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();
    expect(currentBusiness().taskItemChecklist[randomPriorityType]).toBe(false);
    expect(currentBusiness().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
  });

  it("deselect none of the above checkbox when a priority type is selected", async () => {
    const randomPriorityType = randomElementFromArray(allPriorityTypes);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    await userEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(currentBusiness().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(randomPriorityType));
    expect(currentBusiness().taskItemChecklist[randomPriorityType]).toBe(true);
    expect(currentBusiness().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(false);
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();
  });

  it("deselects none of the above checkbox", async () => {
    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    await userEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(currentBusiness().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(true);
    await userEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    expect(currentBusiness().taskItemChecklist[noneOfTheAbovePriorityId]).toBe(false);
  });

  it("task progress remains to-do when user navigates to the second tab", async () => {
    const randomPriorityType = randomElementFromArray([
      ...allPriorityTypes,
      noneOfTheAbovePriorityId,
    ]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    await userEvent.click(screen.getByTestId(randomPriorityType));
    await userEvent.click(await findButton(C.nextButtonText));

    await waitFor(() => {
      expect(within(screen.getByTestId("taskProgress")).getByTestId("TO_DO")).toBeInTheDocument();
    });
    expect(screen.getByText(getTaskStatusUpdatedMessage("TO_DO"))).toBeInTheDocument();
  });

  it("navigates to and from second tab", async () => {
    const randomPriorityType = randomElementFromArray([
      ...allPriorityTypes,
      noneOfTheAbovePriorityId,
    ]);

    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    await userEvent.click(screen.getByTestId(randomPriorityType));
    await userEvent.click(await findButton(C.nextButtonText));

    await waitFor(() => {
      expect(screen.getByText(C.backButtonText)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: C.nextButtonText })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(C.backButtonText));
    expect(await findButton(C.nextButtonText)).toBeInTheDocument();
    expect(screen.queryByText(C.backButtonText)).not.toBeInTheDocument();
  });

  it("selects no priority status checkbox and clicks complete task button", async () => {
    const task = generateTask({
      id: "123",
      name: "Header",
    });
    useMockRoadmapTask(task);

    renderPage(task);
    await userEvent.click(screen.getByTestId(noneOfTheAbovePriorityId));
    await userEvent.click(await findButton(C.nextButtonText));

    await waitFor(() => {
      expect(screen.getByText(C.noPriorityStatusText)).toBeInTheDocument();
    });
    expect(screen.getByText(C.completeTaskProgressButtonText)).toBeInTheDocument();
    expect(screen.queryByText(C.socialEquityButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(C.certificationButtonText)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(C.completeTaskProgressButtonText));
    await waitFor(() => {
      expect(
        within(screen.getByTestId("taskProgress")).getByTestId("COMPLETED"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(getTaskStatusUpdatedMessage("COMPLETED"))).toBeInTheDocument();
  });

  describe("1 priority status only", () => {
    it("impact zone is only type - displays content and complete button", async () => {
      const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

      const task = generateTask({
        id: "123",
        name: "Header",
      });
      useMockRoadmapTask(task);

      renderPage(task);
      await userEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.impactZoneHeaderText)).toBeInTheDocument();
      });
      expect(screen.getByText(C.completeTaskProgressButtonText)).toBeInTheDocument();
      expect(screen.queryByText(C.socialEquityButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.certificationButtonText)).not.toBeInTheDocument();
    });

    it("social equity is only type - displays content and CTA", async () => {
      const randomSocialEquityPriorityType = randomElementFromArray(priorityTypesObj.socialEquity);

      const task = generateTask({
        id: "123",
        name: "Header",
        contentMd: `Content\n- []{${randomSocialEquityPriorityType}}}Random Priority Type Checkbox`,
      });
      useMockRoadmapTask(task);

      renderPage(task);
      await userEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.socialEquityHeaderText)).toBeInTheDocument();
      });
      expect(screen.getByText(C.socialEquityButtonText)).toBeInTheDocument();
      expect(screen.queryByText(C.certificationButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.greenBoxMinorityOrWomenText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.greenBoxVeteranText)).not.toBeInTheDocument();
      expect(screen.getByText(C.greenBoxSocialEquityText)).toBeInTheDocument();
    });

    it("veteran is only type - displays MWBE content and CTA", async () => {
      const randomVeteranPriorityType = randomElementFromArray([...priorityTypesObj.veteran]);

      const task = generateTask({
        id: "123",
        name: "Header",
      });
      useMockRoadmapTask(task);

      renderPage(task);
      await userEvent.click(screen.getByTestId(randomVeteranPriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.veteranHeaderText)).toBeInTheDocument();
      });

      expect(screen.getByText(C.certificationButtonText)).toBeInTheDocument();
      expect(screen.queryByText(C.socialEquityButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();

      expect(screen.queryByText(C.greenBoxMinorityOrWomenText)).not.toBeInTheDocument();
      expect(screen.getByText(C.greenBoxVeteranText)).toBeInTheDocument();
      expect(screen.queryByText(C.greenBoxSocialEquityText)).not.toBeInTheDocument();
    });

    it("minority/women is only type - displays MWBE content and CTA", async () => {
      const randomMinorityOrWomentPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);

      const task = generateTask({
        id: "123",
        name: "Header",
      });
      useMockRoadmapTask(task);

      renderPage(task);
      await userEvent.click(screen.getByTestId(randomMinorityOrWomentPriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.minorityOrWomenHeaderText)).toBeInTheDocument();
      });

      expect(screen.getByText(C.certificationButtonText)).toBeInTheDocument();
      expect(screen.queryByText(C.socialEquityButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();

      expect(screen.getByText(C.greenBoxMinorityOrWomenText)).toBeInTheDocument();
      expect(screen.queryByText(C.greenBoxVeteranText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.greenBoxSocialEquityText)).not.toBeInTheDocument();
    });
  });

  describe("multiple priority statuses", () => {
    it("impact zone + another - does not display complete button", async () => {
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
      await userEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await userEvent.click(screen.getByTestId(randomPriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.impactZoneHeaderText)).toBeInTheDocument();
      });
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();
    });

    it("social equity + minority/women - displays CTAs in dropdown", async () => {
      const randomMinorityOrWomentPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);
      const randomVeteranPriorityType = randomElementFromArray([...priorityTypesObj.veteran]);
      const randomSocialEquityPriorityType = randomElementFromArray(priorityTypesObj.socialEquity);
      const randomImpactZonePriorityType = randomElementFromArray(priorityTypesObj.impactZone);

      const task = generateTask({
        id: "123",
        name: "Header",
      });
      useMockRoadmapTask(task);

      renderPage(task);
      await userEvent.click(screen.getByTestId(randomMinorityOrWomentPriorityType));
      await userEvent.click(screen.getByTestId(randomVeteranPriorityType));
      await userEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await userEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await userEvent.click(await findButton(C.nextButtonText));

      await waitFor(() => {
        expect(screen.getByText(C.minorityOrWomenHeaderText)).toBeInTheDocument();
      });
      expect(screen.getByText(C.veteranHeaderText)).toBeInTheDocument();
      expect(screen.getByText(C.impactZoneHeaderText)).toBeInTheDocument();
      expect(screen.getByText(C.socialEquityHeaderText)).toBeInTheDocument();

      expect(screen.queryByText(C.certificationButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.socialEquityButtonText)).not.toBeInTheDocument();
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(C.dropdownCTAButtonText));
      expect(screen.getByText(C.certificationButtonText)).toBeInTheDocument();
      expect(screen.getByText(C.socialEquityButtonText)).toBeInTheDocument();
      expect(screen.queryByText(C.completeTaskProgressButtonText)).not.toBeInTheDocument();

      expect(screen.getByText(C.greenBoxMinorityOrWomenText)).toBeInTheDocument();
      expect(screen.getByText(C.greenBoxVeteranText)).toBeInTheDocument();
      expect(screen.getByText(C.greenBoxSocialEquityText)).toBeInTheDocument();
    });
  });

  describe("displays eligibility phrases for priority types", () => {
    beforeEach(() => {
      const task = generateTask({});
      useMockRoadmapTask(task);

      renderPage(task);
    });

    it("displays diversely-owned eligibility when minority/women or veteran priority types are selected", async () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);
      const randomVeteranType = randomElementFromArray([...priorityTypesObj.veteran]);

      const eligibilityPhrase = templateEval(C.phrase1, {
        type1: Config.cannabisPriorityStatus.minorityWomenOrVeteran,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      const checkbox1 = screen.getByTestId(randomMinorityOrWomenPriorityType);
      const checkbox2 = screen.getByTestId(randomVeteranType);

      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);

      // Wait for eligibility text to appear
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomVeteranType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });

    it("displays impact zone eligibility when impact zone types are selected", async () => {
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(C.phrase1, {
        type1: Config.cannabisPriorityStatus.impactZone,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });

    it("displays social equity eligibility when social equity types are selected", async () => {
      const randomSocialEquityPriorityType = randomElementFromArray([
        ...priorityTypesObj.socialEquity,
      ]);

      const eligibilityPhrase = templateEval(C.phrase1, {
        type1: Config.cannabisPriorityStatus.socialEquity,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });

    it("displays 2-part eligibility when minority/women AND impact zone are selected", async () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(C.phrase2, {
        type1: Config.cannabisPriorityStatus.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityStatus.impactZone,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });

    it("displays 2-part eligibility when minority/women AND social equity are selected", async () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);
      const randomSocialEquityPriorityType = randomElementFromArray([
        ...priorityTypesObj.socialEquity,
      ]);

      const eligibilityPhrase = templateEval(C.phrase2, {
        type1: Config.cannabisPriorityStatus.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityStatus.socialEquity,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });

    it("displays 3-part eligibility when minority/women, impact zone, AND social equity are selected", async () => {
      const randomMinorityOrWomenPriorityType = randomElementFromArray([
        ...priorityTypesObj.minorityOrWomen,
      ]);
      const randomSocialEquityPriorityType = randomElementFromArray([
        ...priorityTypesObj.socialEquity,
      ]);
      const randomImpactZonePriorityType = randomElementFromArray([...priorityTypesObj.impactZone]);

      const eligibilityPhrase = templateEval(C.phrase3, {
        type1: Config.cannabisPriorityStatus.minorityWomenOrVeteran,
        type2: Config.cannabisPriorityStatus.impactZone,
        type3: Config.cannabisPriorityStatus.socialEquity,
      });

      expect(
        screen.queryByText((content, element) => element?.textContent === eligibilityPhrase),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.getAllByText(
              (content, element) => element?.textContent === eligibilityPhrase,
            )[0],
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      fireEvent.click(screen.getByTestId(randomMinorityOrWomenPriorityType));
      fireEvent.click(screen.getByTestId(randomImpactZonePriorityType));
      fireEvent.click(screen.getByTestId(randomSocialEquityPriorityType));
      await waitFor(
        () => {
          expect(
            screen.queryAllByText((content, element) => element?.textContent === eligibilityPhrase),
          ).toHaveLength(0);
        },
        { timeout: 3000 },
      );
    });
  });
});
