import { TaxTask } from "@/components/tasks/TaxTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateProfileData,
  generateTask,
  generateUserData,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

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

    it("displays the Tax ID field with an existing 9 digit Tax ID and updates the progress to IN_PROGRESS", async () => {
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

  describe("displaying Tax ID", () => {
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
        profileData: generateProfileData({ taxId: "*******89123", encryptedTaxId: "some-encrypted-value" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays Tax ID and success message when it exists in data and is 12 digits in length", () => {
      renderPage();
      expect(screen.queryByText(Config.tax.placeholderText)).not.toBeInTheDocument();
      expect(
        screen.getByText(templateEval(Config.tax.successText, { taxID: "*******89123" }))
      ).toBeInTheDocument();
    });

    it("navigates back to empty input on remove button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.removeText));
      expect(screen.getByText(Config.tax.saveButtonText)).toBeInTheDocument();
      expect((screen.getByPlaceholderText(Config.tax.placeholderText) as HTMLInputElement).value).toEqual("");
      expect(screen.queryByText(Config.taskDefaults.removeText)).not.toBeInTheDocument();
    });

    it("empties both tax id and encrypted tax id field on remove button click", () => {
      renderPage();
      fireEvent.click(screen.getByText(Config.taskDefaults.removeText));
      expect(currentUserData().profileData.taxId).toEqual(undefined);
      expect(currentUserData().profileData.encryptedTaxId).toEqual(undefined);
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

  describe("tax id disclaimer", () => {
    const renderComponent = (initialUserData?: UserData) => {
      render(
        <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
          <TaxTask task={task} />
        </WithStatefulUserData>
      );
    };

    it("shows disclaimer for trade name legal structure", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
        }),
      });
      renderComponent(userData);

      expect(screen.getByTestId("tax-disclaimer")).toHaveTextContent(
        markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd)
      );
    });

    it("does not show disclaimer for public filing legal structure", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      renderComponent(userData);

      expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
    });
  });
});
