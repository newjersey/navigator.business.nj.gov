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
import { UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

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

  describe("inputting NAICS code", () => {
    let initialUserData: UserData;

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
      subject = render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />)
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    });

    it("enters and saves NAICS code", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "123456" },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.naicsCode).toEqual("123456");
      });
    });

    it("shows error on validation failure", () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "12345" },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      expect(subject.getByText(Config.determineNaicsCode.validationErrorText)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("displays code with success message on save", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "123456" },
      });
      fireEvent.click(subject.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(subject.queryByText(Config.determineNaicsCode.inputPlaceholder)).not.toBeInTheDocument();
        expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
      });
    });

    it("sets task status to COMPLETED on save", async () => {
      fireEvent.change(subject.getByPlaceholderText(Config.determineNaicsCode.inputPlaceholder), {
        target: { value: "123456" },
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
        profileData: generateProfileData({ naicsCode: "123456" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      subject = render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />)
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    });

    it("displays code immediately when NAICS code exists in data", () => {
      expect(subject.queryByText(Config.determineNaicsCode.inputPlaceholder)).not.toBeInTheDocument();
      expect(subject.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
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
