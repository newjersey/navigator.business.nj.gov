import { TaxTask } from "@/components/tasks/TaxTask";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateTask,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulDataFieldFormContext } from "@/test/mock/withStatefulProfileData";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement, ReactNode } from "react";

/*
 * NOTE: Tests in this file use fireEvent.change() instead of userEvent.type() for numeric inputs
 * due to a known React 19 + MUI + @testing-library/user-event bug where userEvent.type() only
 * enters the first character in controlled numeric inputs.
 *
 * See: https://github.com/testing-library/user-event/issues/1286
 * "JavaScript heap out of memory" - userEvent.type() causes infinite loops with React 19 + MUI number inputs
 *
 * Once this upstream issue is fixed, these tests should be converted back to userEvent.type()
 * for more realistic user interaction simulation.
 */

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

const WithStatefulBusiness = ({
  children,
  initialBusiness,
}: {
  children: ReactNode;
  initialBusiness: Business;
}): ReactElement => (
  <WithStatefulDataFieldFormContext>
    <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
      {children}
    </WithStatefulUserData>
  </WithStatefulDataFieldFormContext>
);

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
    render(
      <WithStatefulBusiness initialBusiness={generateBusiness({})}>
        <TaxTask task={task} />
      </WithStatefulBusiness>,
    );
    expect(screen.getByText("some content here")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${taxInputComponent}")).not.toBeInTheDocument();
    expect(screen.getByText(Config.taxId.descriptionText)).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(
      <WithStatefulBusiness initialBusiness={generateBusiness({})}>
        <TaxTask task={task} />
      </WithStatefulBusiness>,
    );
    expect(screen.getByText(ctaText)).toBeInTheDocument();
  });

  it("shows disabled taxId when taxCalendar is PENDING or SUCCESS", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        taxId: "*******89123",
        encryptedTaxId: "some-encrypted-value",
      }),
      taxFilingData: generateTaxFilingData({ state: randomInt() % 2 ? "SUCCESS" : "PENDING" }),
    });
    render(
      <WithStatefulBusiness initialBusiness={business}>
        <ThemeProvider theme={createTheme()}>
          <TaxTask task={task} />
        </ThemeProvider>
      </WithStatefulBusiness>,
    );
    expect(screen.queryByLabelText("Tax id")).not.toBeInTheDocument();
    expect(screen.getByTestId("disabled-taxid")).toHaveTextContent(Config.taxId.lockedPostText);
    expect(screen.getByTestId("disabled-taxid")).toHaveTextContent(Config.taxId.lockedPreText);
    expect(screen.getByTestId("disabled-tax-id-value")).toHaveTextContent("****-****-****");
  });

  describe("inputting Tax ID", () => {
    let initialBusiness: Business;

    const renderPage = (): void => {
      render(
        withNeedsAccountContext(
          <WithStatefulBusiness initialBusiness={initialBusiness}>
            <TaxTask task={task} />
          </WithStatefulBusiness>,
          IsAuthenticated.TRUE,
        ),
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "TO_DO" },
      });
    });

    it("shows the save button text for an authenticated user", async () => {
      renderPage();
      expect(screen.getByText(Config.taxId.saveButtonText)).toBeInTheDocument();
    });

    it("updates the progress of the task to TO_DO if there is a pre-existing 9 digit tax id", async () => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      renderPage();
      await waitFor(() => {
        expect(currentBusiness().taskProgress[taskId]).toEqual("TO_DO");
      });
    });

    it("renders a single field with 9 digit tax id formatted", async () => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      renderPage();
      await waitFor(() => {
        const taxIdInput = screen.getByLabelText("Tax id") as HTMLInputElement;
        expect(taxIdInput.value).toEqual("123-456-789");
      });
      // Should NOT have a location field
      expect(screen.queryByLabelText("Tax id location")).not.toBeInTheDocument();
    });

    // Test enters and saves Tax ID, verifying save functionality
    it("enters and saves Tax ID", async () => {
      renderPage();
      const taxIdInput = screen.getByLabelText("Tax id");
      // Using fireEvent due to React 19 + MUI bug (see file header comment)
      fireEvent.change(taxIdInput, { target: { value: "123456789123" } });
      fireEvent.blur(taxIdInput);

      const saveButton = screen.getByText(Config.taxId.saveButtonText);
      await userEvent.click(saveButton);

      // Check that the value was saved (encrypted or plain, depending on environment)
      await waitFor(() => {
        const business = currentBusiness();
        const savedTaxId = business.profileData.taxId;
        const encryptedTaxId = business.profileData.encryptedTaxId;
        // Either taxId or encryptedTaxId should have a value
        expect(savedTaxId || encryptedTaxId).toBeTruthy();
      });

      // Verify task progress was updated
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });

    it("shows error on length validation failure", async () => {
      renderPage();
      const expectedErrorMessage = templateEval(
        Config.profileDefaults.fields.taxId.default.errorTextRequired,
        {
          length: "12",
        },
      );
      const taxIdInput = screen.getByLabelText("Tax id");
      await userEvent.clear(taxIdInput);
      // Use 10 digits (invalid - only 9 or 12 are valid)
      await userEvent.type(taxIdInput, "1231231230");

      const saveButton = screen.getByText(Config.taxId.saveButtonText);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
      });
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      const taxIdInput = screen.getByLabelText("Tax id");
      // Using fireEvent due to React 19 + MUI bug (see file header comment)
      fireEvent.change(taxIdInput, { target: { value: "123456789123" } });
      fireEvent.blur(taxIdInput);

      const saveButton = screen.getByText(Config.taxId.saveButtonText);
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
      });
    });
  });

  describe("displaying Tax ID", () => {
    let initialBusiness: Business;

    const renderPage = (): void => {
      render(
        withNeedsAccountContext(
          <WithStatefulBusiness initialBusiness={initialBusiness}>
            <TaxTask task={task} />
          </WithStatefulBusiness>,
          IsAuthenticated.TRUE,
        ),
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({
          taxId: "*******89123",
          encryptedTaxId: "some-encrypted-value",
        }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays Tax ID and success message when it exists in data and is 12 digits in length", () => {
      renderPage();
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual(
        "***-***-*89/123",
      );
      expect(screen.getByLabelText("Tax id")).toBeDisabled();
    });
  });

  describe("guest mode", () => {
    let initialBusiness: Business;
    const setShowNeedsAccountModal = jest.fn();

    const renderPage = (): void => {
      render(
        withNeedsAccountContext(
          <WithStatefulBusiness initialBusiness={initialBusiness}>
            <TaxTask task={task} />
          </WithStatefulBusiness>,
          IsAuthenticated.FALSE,
          { showNeedsAccountModal: false, setShowNeedsAccountModal },
        ),
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "TO_DO" },
      });
    });

    it("prepends register to the Save button", async () => {
      renderPage();
      expect(screen.getByText(`Register & ${Config.taxId.saveButtonText}`)).toBeInTheDocument();
    });

    it("opens Needs Account modal on save button click", async () => {
      renderPage();
      const saveButton = screen.getByText(`Register & ${Config.taxId.saveButtonText}`);
      await userEvent.click(saveButton);

      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(userDataWasNotUpdated()).toBe(true);
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
      ).not.toBeInTheDocument();
    });

    it("opens Needs Account modal when trying to enter tax input data, and does not show inline errors or update userData", async () => {
      renderPage();
      const taxIdInput = screen.getByLabelText("Tax id");
      await userEvent.type(taxIdInput, "1");
      await userEvent.tab();

      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(userDataWasNotUpdated()).toBe(true);
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("Tax id")).toHaveValue("");
    });
  });

  describe("tax id disclaimer", () => {
    const renderComponent = (initialBusiness: Business): void => {
      render(
        <WithStatefulBusiness initialBusiness={initialBusiness}>
          <TaxTask task={task} />
        </WithStatefulBusiness>,
      );
    };

    it("shows disclaimer for trade name legal structure", () => {
      const initialBusiness = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
        }),
      });
      renderComponent(initialBusiness);

      expect(screen.getByTestId("tax-disclaimer")).toHaveTextContent(
        markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd),
      );
    });

    it("does not show disclaimer for public filing legal structure", () => {
      const initialBusiness = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      renderComponent(initialBusiness);

      expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
    });
  });
});
