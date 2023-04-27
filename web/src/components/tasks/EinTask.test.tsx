import { EinTask } from "@/components/tasks/EinTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { generateProfileData, generateUserData, UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<EinTask />", () => {
  let task: Task;
  const content = "some content here\n\n" + "${einInputComponent}\n\n" + "more content";
  const taskId = "12345";

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
    task = generateTask({ contentMd: content, id: taskId });
  });

  it("replaces ${einInputComponent} with EinInput component", () => {
    render(<EinTask task={task} />);
    expect(screen.getByText("some content here")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${einInputComponent}")).not.toBeInTheDocument();
    expect(screen.getByText(Config.ein.descriptionText)).toBeInTheDocument();
  });

  describe("inputting EIN", () => {
    let initialUserData: UserData;

    const renderPage = (): void => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <EinTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ employerId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("shows the save button text for an authenticated user", async () => {
      renderPage();
      expect(screen.getByText(`${Config.ein.saveButtonText}`)).toBeInTheDocument();
    });

    it("enters and saves EIN", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save your EIN"), {
        target: { value: "123456789" },
      });
      fireEvent.click(screen.getByText(Config.ein.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.employerId).toEqual("123456789");
      });
    });

    it("shows error on length validation failure", () => {
      renderPage();
      const expectedErrorMessage = templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
        length: "9",
      });
      fireEvent.change(screen.getByLabelText("Save your EIN"), {
        target: { value: "12345" },
      });
      fireEvent.click(screen.getByText(Config.ein.saveButtonText));
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("displays code with success message on save", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save your EIN"), {
        target: { value: "123456789" },
      });
      fireEvent.click(screen.getByText(Config.ein.saveButtonText));
      await waitFor(() => {
        expect(screen.getByText(Config.taskDefaults.editText)).toBeInTheDocument();
      });
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save your EIN"), {
        target: { value: "123456789" },
      });
      fireEvent.click(screen.getByText(Config.ein.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("displaying EIN", () => {
    let initialUserData: UserData;

    const renderPage = (): void => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <EinTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ employerId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays EIN when it exists in data", () => {
      renderPage();
      expect(screen.getByText("12-3456789", { exact: false })).toBeInTheDocument();
    });

    it("navigates back to input on edit button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.editText));
      expect(screen.getByText(Config.ein.saveButtonText)).toBeInTheDocument();
      expect((screen.getByLabelText("Save your EIN") as HTMLInputElement).value).toEqual("12-3456789");
      expect(screen.queryByText(Config.taskDefaults.editText)).not.toBeInTheDocument();
    });

    it("navigates back to empty input on remove button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.removeText));
      expect(screen.getByText(Config.ein.saveButtonText)).toBeInTheDocument();
      expect((screen.getByLabelText("Save your EIN") as HTMLInputElement).value).toEqual("");
      expect(screen.queryByText(Config.taskDefaults.removeText)).not.toBeInTheDocument();
      expect(currentUserData().profileData.employerId).toEqual(undefined);
    });

    it("sets task status to in-progress on edit button", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.editText));
      expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    it("sets task status to in-progress on remove button", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.removeText));
      expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });
  });

  describe("guest mode", () => {
    let initialUserData: UserData;
    const setRegistrationModalIsVisible = jest.fn();

    const renderPage = (): void => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <EinTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { registrationModalIsVisible: false, setRegistrationModalIsVisible }
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ employerId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("prepends register to the Save button", async () => {
      renderPage();
      expect(screen.getByText(`Register & ${Config.ein.saveButtonText}`)).toBeInTheDocument();
    });

    it("opens registration modal on save button click", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save your EIN"), {
        target: { value: "123456789" },
      });
      fireEvent.click(screen.getByText(`Register & ${Config.ein.saveButtonText}`));
      await waitFor(() => {
        return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    });
  });
});
