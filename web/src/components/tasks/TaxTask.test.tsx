import { TaxTask } from "@/components/tasks/TaxTask";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateTask,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulProfileFormContext } from "@/test/mock/withStatefulProfileData";
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
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

const WithStatefulBusiness = ({
  children,
  initialBusiness,
}: {
  children: ReactNode;
  initialBusiness: Business;
}): ReactElement<any> => (
  <WithStatefulProfileFormContext>
    <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
      {children}
    </WithStatefulUserData>
  </WithStatefulProfileFormContext>
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
      </WithStatefulBusiness>
    );
    expect(screen.getByText("some content here")).toBeInTheDocument();
    expect(screen.getByText("more content")).toBeInTheDocument();
    expect(screen.queryByText("${taxInputComponent}")).not.toBeInTheDocument();
    expect(screen.getByText(Config.tax.descriptionText)).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(
      <WithStatefulBusiness initialBusiness={generateBusiness({})}>
        <TaxTask task={task} />
      </WithStatefulBusiness>
    );
    expect(screen.getByText(ctaText)).toBeInTheDocument();
  });

  it("shows disabled taxId when taxCalendar is PENDING or SUCCESS", () => {
    const business = generateBusiness({
      profileData: generateProfileData({ taxId: "*******89123", encryptedTaxId: "some-encrypted-value" }),
      taxFilingData: generateTaxFilingData({ state: randomInt() % 2 ? "SUCCESS" : "PENDING" }),
    });
    render(
      <WithStatefulBusiness initialBusiness={business}>
        <ThemeProvider theme={createTheme()}>
          <TaxTask task={task} />
        </ThemeProvider>
      </WithStatefulBusiness>
    );
    expect(screen.queryByLabelText("Tax id")).not.toBeInTheDocument();
    expect(screen.getByTestId("disabled-taxid")).toHaveTextContent(Config.tax.lockedPostText);
    expect(screen.getByTestId("disabled-taxid")).toHaveTextContent(Config.tax.lockedPreText);
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
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("shows the save button text for an authenticated user", async () => {
      renderPage();
      expect(screen.getByText(Config.tax.saveButtonText)).toBeInTheDocument();
    });

    it("updates the progress of the task to IN_PROGRESS if there is a pre-existing 9 digit tax id", async () => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      renderPage();
      await waitFor(() => {
        expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
      });
    });

    it("renders the split field if there is a pre-existing 9 digit tax id", async () => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "123456789" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByLabelText("Tax id location")).toBeInTheDocument();
      });
    });

    it("enters and saves Tax ID", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789123" } });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      await waitFor(() => {
        expect(currentBusiness().profileData.taxId).toEqual("123456789123");
      });
    });

    it("shows error on length validation failure", () => {
      renderPage();
      const expectedErrorMessage = templateEval(
        Config.profileDefaults.fields.taxId.default.errorTextRequired,
        {
          length: "12",
        }
      );
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123123123" } });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
      expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("sets task status to COMPLETED on save", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789123" } });
      fireEvent.click(screen.getByText(Config.tax.saveButtonText));
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
          IsAuthenticated.TRUE
        )
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "*******89123", encryptedTaxId: "some-encrypted-value" }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
    });

    it("displays Tax ID and success message when it exists in data and is 12 digits in length", () => {
      renderPage();
      expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("***-***-*89/123");
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
          { showNeedsAccountModal: false, setShowNeedsAccountModal }
        )
      );
    };

    beforeEach(() => {
      initialBusiness = generateBusiness({
        profileData: generateProfileData({ taxId: "" }),
        taskProgress: { [taskId]: "NOT_STARTED" },
      });
    });

    it("prepends register to the Save button", async () => {
      renderPage();
      expect(screen.getByText(`Register & ${Config.tax.saveButtonText}`)).toBeInTheDocument();
    });

    it("opens Needs Account modal on save button click", async () => {
      renderPage();
      fireEvent.click(screen.getByText(`Register & ${Config.tax.saveButtonText}`));
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(userDataWasNotUpdated()).toBe(true);
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("opens Needs Account modal when trying to enter tax input data, and does not show inline errors or update userData", async () => {
      renderPage();
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "1" } });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
      expect(userDataWasNotUpdated()).toBe(true);
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("Tax id")).toHaveValue("");
    });
  });

  describe("tax id disclaimer", () => {
    const renderComponent = (initialBusiness: Business): void => {
      render(
        <WithStatefulBusiness initialBusiness={initialBusiness}>
          <TaxTask task={task} />
        </WithStatefulBusiness>
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
        markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd)
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
