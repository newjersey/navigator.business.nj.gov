import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
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
import { LookupIndustryById, UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
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
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const validNaicsCode = LookupIndustryById(validIndustryId).naicsCodes!.split(",")[0];
const Config = getMergedConfig();

describe("<NaicsCodeTask />", () => {
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
    render(<NaicsCodeTask task={task} />);
    expect(screen.getByText("some content here")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${naicsCodeLookupComponent}")).not.toBeInTheDocument();
    expect(screen.getByText(Config.determineNaicsCode.findCodeHeader)).toBeInTheDocument();
  });

  describe("NAICS code radio buttons", () => {
    let initialUserData: UserData;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "", industryId: validIndustryId }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("shows the radio buttons when an industry has a recommended NAICS code", () => {
      renderPage();
      expect(screen.getByTestId("naics-radio-input")).toBeInTheDocument();
      expect(screen.getByLabelText("Recommended NAICS codes")).toBeInTheDocument();
      expect(screen.getByTestId(`naics-radio-${validNaicsCode}`)).toBeInTheDocument();
    });

    it("links description to NAICS code website", () => {
      renderPage();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const description = (NaicsCodes as NaicsCodeObject[]).find((element) => {
        return element.SixDigitCode?.toString() === validNaicsCode;
      })!.SixDigitDescription!;

      const expectedUrl = templateEval(Config.determineNaicsCode.naicsDescriptionURL, {
        code: validNaicsCode,
      });

      expect(screen.getByText(description)).toHaveAttribute("href", expectedUrl);
    });

    it("hides input field by default", () => {
      renderPage();
      expect(screen.queryByLabelText("Save NAICS Code")).not.toBeInTheDocument();
    });

    it("updates task progress when radio button is pressed", async () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-${validNaicsCode}`));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("IN_PROGRESS");
      });
    });

    it("saves NAICS code", async () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.naicsCode).toEqual(validNaicsCode);
      });
    });

    it("shows input box when radio button is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-input`));
      expect(screen.getByLabelText("Save NAICS Code")).toBeInTheDocument();
    });

    it("hides input box when NAICS code radio button is clicked", () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-input`));
      expect(screen.getByLabelText("Save NAICS Code")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId(`naics-radio-${validNaicsCode}`));
      expect(screen.queryByLabelText("Save NAICS Code")).not.toBeInTheDocument();
    });

    it("displays code with success message on save", async () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(screen.getByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
      });
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      fireEvent.click(screen.getByTestId(`naics-radio-${validNaicsCode}`));

      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("inputting NAICS code", () => {
    let initialUserData: UserData;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "", industryId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("does not show the radio button on generic industry", () => {
      renderPage();
      expect(screen.queryByTestId("naics-radio-input")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Recommended NAICS codes")).not.toBeInTheDocument();
    });

    it("shows the correct save button text", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: "12345" },
      });

      expect(screen.getByText(`${Config.determineNaicsCode.saveButtonText}`)).toBeInTheDocument();
    });

    it("enters and saves NAICS code", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().profileData.naicsCode).toEqual(validNaicsCode);
      });
    });

    it("shows error on length validation failure", () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: "12345" },
      });
      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      expect(screen.getByText(Config.determineNaicsCode.lengthValidationErrorText)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("shows error on invalid code failure on input", () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: "123457" },
      });
      expect(screen.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      expect(screen.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("hides error for invalid code failure on input", () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: "123457" },
      });
      expect(screen.getByText(Config.determineNaicsCode.invalidValidationErrorText)).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: "12345" },
      });
      expect(
        screen.queryByText(Config.determineNaicsCode.invalidValidationErrorText)
      ).not.toBeInTheDocument();
    });

    it("displays code with success message on save", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(screen.getByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
      });
      expect(screen.queryByLabelText("Save NAICS Code")).not.toBeInTheDocument();
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(screen.getByText(Config.determineNaicsCode.saveButtonText));
      await waitFor(() => {
        expect(currentUserData().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("displaying NAICS code", () => {
    let initialUserData: UserData;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: validNaicsCode }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays code when NAICS code exists in data", () => {
      renderPage();
      expect(screen.queryByLabelText("Save NAICS Code")).not.toBeInTheDocument();
      expect(screen.getByText(Config.determineNaicsCode.hasSavedCodeHeader)).toBeInTheDocument();
    });

    it("displays description when NAICS code exists in data", () => {
      renderPage();
      expect(screen.getByText("test1234")).toBeInTheDocument();
    });

    it("navigates back to input and sets on edit button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.editText));
      expect(screen.getByText(Config.determineNaicsCode.findCodeHeader)).toBeInTheDocument();
      expect((screen.getByLabelText("Save NAICS Code") as HTMLInputElement).value).toEqual(validNaicsCode);
      expect(screen.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).not.toBeInTheDocument();
    });

    it("navigates back to empty input on remove button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.removeText));
      expect(screen.getByText(Config.determineNaicsCode.findCodeHeader)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId(`naics-radio-input`));
      expect((screen.getByLabelText("Save NAICS Code") as HTMLInputElement).value).toEqual("");
      expect(screen.queryByText(Config.determineNaicsCode.hasSavedCodeHeader)).not.toBeInTheDocument();
      expect(currentUserData().profileData.naicsCode).toEqual("");
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
    let setRegistrationModalIsVisible: jest.Mock;

    const renderPage = () => {
      render(
        withAuthAlert(
          <WithStatefulUserData initialUserData={initialUserData}>
            <NaicsCodeTask task={task} />
          </WithStatefulUserData>,
          IsAuthenticated.FALSE,
          { registrationModalIsVisible: false, setRegistrationModalIsVisible }
        )
      );
    };

    beforeEach(() => {
      setRegistrationModalIsVisible = jest.fn();
      initialUserData = generateUserData({
        profileData: generateProfileData({ naicsCode: "", industryId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("prepends register to the next button", async () => {
      renderPage();
      expect(screen.getByText(`Register & ${Config.determineNaicsCode.saveButtonText}`)).toBeInTheDocument();
    });

    it("opens registration modal on save button click", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Save NAICS Code"), {
        target: { value: validNaicsCode },
      });
      fireEvent.click(screen.getByText(`Register & ${Config.determineNaicsCode.saveButtonText}`));
      await waitFor(() => {
        return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    });
  });
});
