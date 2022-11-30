import { TaxTask } from "@/components/tasks/TaxTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});

const Config = getMergedConfig();

describe("<TaxTask />", () => {
  let task: Task;
  const content = "some content here\n\n" + "${taxInputComponent}\n\n" + "more content";
  const taskId = "12345";
  const ctaText = "some-CTA-Text";

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
    task = generateTask({ contentMd: content, id: taskId, callToActionText: ctaText });
  });

  it("replaces ${taxInputComponent} with taxInput component", () => {
    render(<TaxTask task={task} />);
    expect(screen.getByText("some content here")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${taxInputComponent}")).not.toBeInTheDocument();
    expect(screen.getByText(Config.tax.descriptionText)).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(<TaxTask task={task} />);
    expect(screen.getByText(ctaText)).toBeInTheDocument();
  });

  describe("inputting Tax ID", () => {
    let initialUserData: UserData;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <TaxTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("shows the save button text for an authenticated user", async () => {
      renderPage();
      expect(screen.getByText(Config.tax.saveButtonText)).toBeInTheDocument();
    });

    it("displays the Tax ID field with an existing 9 digit tax Id and updates the progress to IN_PROGRESS", async () => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ taxId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      renderPage();
      expect(screen.getByLabelText("Save your NJ Tax ID")).toBeInTheDocument();
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
      });
    });

    it("enters and saves Tax ID", async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText(Config.tax.placeholderText), {
        target: { value: "123456789123" },
      });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.taxId).toEqual("123456789123");
      });
    });

    it("shows error on length validation failure", () => {
      renderPage();
      const expectedErrorMessage = templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
        length: "12",
      });
      fireEvent.change(screen.getByPlaceholderText(Config.tax.placeholderText), {
        target: { value: "123123123" },
      });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("displays tax id with success message on save", async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText(Config.tax.placeholderText), {
        target: { value: "123456789123" },
      });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      await waitFor(() => {
        expect(screen.getByText(Config.tax.editText)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.tax.placeholderText)).not.toBeInTheDocument();
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText(Config.tax.placeholderText), {
        target: { value: "123456789123" },
      });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("displaying tax id", () => {
    let initialUserData: UserData;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <TaxTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ taxId: "123456789123" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays tax id when it exists in data and is 12 digits in length", () => {
      renderPage();
      expect(screen.queryByText(Config.tax.placeholderText)).not.toBeInTheDocument();
      expect(
        screen.getByText(templateEval(Config.tax.successText, { taxID: "123456789123" }))
      ).toBeInTheDocument();
    });

    it("navigates back to input on edit button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.tax.editText));
      expect(screen.getByText(Config.tax.saveButtonText)).toBeInTheDocument();
      expect((screen.getByPlaceholderText(Config.tax.placeholderText) as HTMLInputElement).value).toEqual(
        "123456789123"
      );
      expect(screen.queryByText(Config.tax.editText)).not.toBeInTheDocument();
    });

    it("navigates back to empty input on remove button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.tax.removeText));
      expect(screen.getByText(Config.tax.saveButtonText)).toBeInTheDocument();
      expect((screen.getByPlaceholderText(Config.tax.placeholderText) as HTMLInputElement).value).toEqual("");
      expect(screen.queryByText(Config.tax.removeText)).not.toBeInTheDocument();
      expect(currentUserData().profileData.taxId).toEqual(undefined);
    });

    it("sets task status to in-progress on edit button", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.tax.editText));
      expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });
  });

  describe("guest mode", () => {
    let initialUserData: UserData;
    const setRegistrationModalIsVisible = jest.fn();

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <TaxTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { registrationModalIsVisible: false, setRegistrationModalIsVisible }
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("prepends register to the Save button", async () => {
      renderPage();
      expect(screen.getByText(`Register & ${Config.tax.saveButtonText}`)).toBeInTheDocument();
    });

    it("opens registration modal on save button click", async () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText(Config.tax.placeholderText), {
        target: { value: "123456789123" },
      });
      fireEvent.click(screen.getByText(`Register & ${Config.tax.saveButtonText}`));
      await waitFor(() => {
        return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    });
  });
});
