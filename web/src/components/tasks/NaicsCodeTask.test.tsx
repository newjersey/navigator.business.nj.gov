import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Task } from "@/lib/types/types";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupIndustryById, UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/static/records/naics2022.json", () => {
  const industryId = "auto-body-repair";
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { generateNaicsObject } = require("@/test/factories");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { LookupIndustryById } = require("@businessnjgovnavigator/shared");
  const naicsCodes = LookupIndustryById(industryId).naicsCodes?.split(",");
  const thing = generateNaicsObject({ SixDigitDescription: "test1234" }, naicsCodes[0]);
  return [thing];
});

const validIndustryId = "auto-body-repair";
const validNaicsCode = LookupIndustryById(validIndustryId).naicsCodes?.split(",")[0];

describe("<NaicsCodeTask />", () => {
  let subject: RenderResult;
  let task: Task;
  const content = "some content here\n\n" + "${naicsCodeLookupComponent}\n\n" + "more content";
  const taskId = "12345";

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
    task = generateTask({ contentMd: content, id: taskId });
  });

  it("replaces ${naicsCodeLookupComponent} with NaicsCodeLookup component", () => {
    subject = render(<NaicsCodeTask task={task} />);
    expect(subject.getByText("some content here")).toBeInTheDocument();
    expect(subject.getByText("more content")).toBeInTheDocument();
    expect(subject.queryByText("${naicsCodeLookupComponent}")).not.toBeInTheDocument();
    expect(subject.getByText(Config.determineNaicsCode.findCodeHeader)).toBeInTheDocument();
  });

  describe("NAICS code radio buttons", () => {
    let initialUserData: UserData;

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "", industryId: validIndustryId }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });

      subject = render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    });

    it("shows the radio buttons when an industry has a recommended NAICS code", async () => {
      expect(subject.getByTestId("naics-radio-input")).toBeInTheDocument();
      expect(subject.getByLabelText("Recommended NAICS codes")).toBeInTheDocument();
      expect(subject.getByTestId(`naics-radio-${validNaicsCode}`)).toBeInTheDocument();
    });

    it("hides input field by default", async () => {
      expect(
        subject.queryByPlaceholderText(Config.determineNaicsCode.inputPlaceholder)
      ).not.toBeInTheDocument();
    });

    it("updates task progress when radio button is pressed", async () => {
      fireEvent.click(subject.getByTestId(`naics-radio-${validNaicsCode}`));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
      });
    });

    it("saves NAICS code", async () => {
      fireEvent.click(subject.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.naicsCode).toEqual(validNaicsCode);
      });
    });

    it("shows input box when radio button is clicked", async () => {
      fireEvent.click(subject.getByTestId(`naics-radio-input`));
      expect(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder)).toBeInTheDocument();
    });

    it("hides input box when NAICS code radio button is clicked", () => {
      fireEvent.click(subject.getByTestId(`naics-radio-input`));
      expect(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder)).toBeInTheDocument();
      fireEvent.click(subject.getByTestId(`naics-radio-${validNaicsCode}`));
      expect(
        subject.queryByPlaceholderText(Config.determineNaicsCode.inputPlaceholder)
      ).not.toBeInTheDocument();
    });

    it("displays code with success message on save", async () => {
      fireEvent.click(subject.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
      });
    });

    it("sets task status to COMPLETED on save", async () => {
      fireEvent.click(subject.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("inputting NAICS code", () => {
    let initialUserData: UserData;

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "", industryId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });

      subject = render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    });

    it("does not show the radio button on generic industry", async () => {
      expect(subject.queryByTestId("naics-radio-input")).not.toBeInTheDocument();
      expect(subject.queryByLabelText("Recommended NAICS codes")).not.toBeInTheDocument();
    });

    it("enters and saves NAICS code", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.naicsCode).toEqual(validNaicsCode);
      });
    });

    it("shows error on length validation failure", () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "12345" },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      expect(subject.getByText(Config.determineNaicsCode.lengthValidationErrorText)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("shows error on invalid code failure on input", () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "123457" },
      });
      expect(subject.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      expect(subject.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("hides error for invalid code failure on input", () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "123457" },
      });
      expect(subject.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "12345" },
      });
      expect(
        subject.queryByText(Config.determineNaicsCode.invalidValidationErrorText)
      ).not.toBeInTheDocument();
    });

    it("displays code with success message on save", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(subject.queryByText(Config.determineNaicsCode.inputPlaceholder)).not.toBeInTheDocument();
        expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
      });
    });

    it("sets task status to COMPLETED on save", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("displaying NAICS code", () => {
    let initialUserData: UserData;

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: validNaicsCode }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      subject = render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    });

    it("displays code when NAICS code exists in data", () => {
      expect(subject.queryByText(Config.determineNaicsCode.inputPlaceholder)).not.toBeInTheDocument();
      expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
    });

    it("displays description when NAICS code exists in data", () => {
      expect(subject.getByText("test1234")).toBeInTheDocument();
    });

    it("navigates back to input on edit button", () => {
      fireEvent.click(subject.getByText(Config.determineNaicsCode.editText));
      expect(subject.queryByText(Config.determineNaicsCode.findCodeHeader)).toBeInTheDocument();
      expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).not.toBeInTheDocument();
    });

    it("sets task status to in-progress on edit button", () => {
      fireEvent.click(subject.getByText(Config.determineNaicsCode.editText));
      expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });
  });
});
