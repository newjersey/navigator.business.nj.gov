import { generateEmptyFormationData, generateFormationDbaContent } from "@/test/factories";
import {
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();

// Minimal mock declarations - useSetupInitialMocks() handles all implementations
jest.mock("@/lib/data-hooks/useUserData");
jest.mock("@/lib/data-hooks/useRoadmap");
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/compat/router");
jest.mock("@/lib/api-client/apiClient");
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

describe("Formation - ReviewConfirmation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const renderReviewStep = async (): Promise<void> => {
    const profileData = generateFormationProfileData({
      legalStructureId: "limited-liability-company",
    });
    const formationData = generateEmptyFormationData();

    const page = preparePage({
      business: { profileData, formationData },
      displayContent: { formationDbaContent: generateFormationDbaContent({}) },
    });

    await page.stepperClickToReviewStep();
  };

  it("renders confirmation title and all checkbox labels", async () => {
    await renderReviewStep();

    expect(
      screen.getByText(Config.formation.sections.review.confirmationBox.title),
    ).toBeInTheDocument();

    expect(
      within(screen.getByTestId("names-addresses-dates-checkbox-container")).getByRole("checkbox"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("permanent-record-checkbox-container")).getByRole("checkbox"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("correction-fees-checkbox-container")).getByRole("checkbox"),
    ).toBeInTheDocument();
  });

  it("does not show inline error before submission when boxes are unchecked", async () => {
    await renderReviewStep();
    expect(
      screen.queryByText(Config.formation.sections.review.confirmationBox.confirmationError),
    ).not.toBeInTheDocument();
  });

  it("shows inline error after submit when any checkbox is unchecked", async () => {
    await renderReviewStep();

    await userEvent.click(screen.getByText(Config.formation.general.submitButtonText));

    expect(
      screen.getByText(Config.formation.sections.review.confirmationBox.confirmationError),
    ).toBeInTheDocument();
  });

  it("removes inline error after checking all three boxes post-submit", async () => {
    await renderReviewStep();

    await userEvent.click(screen.getByText(Config.formation.general.submitButtonText));
    expect(
      screen.getByText(Config.formation.sections.review.confirmationBox.confirmationError),
    ).toBeInTheDocument();

    const namesDatesBox = within(
      screen.getByTestId("names-addresses-dates-checkbox-container"),
    ).getByRole("checkbox");
    const permanentRecordBox = within(
      screen.getByTestId("permanent-record-checkbox-container"),
    ).getByRole("checkbox");
    const correctionFeesBox = within(
      screen.getByTestId("correction-fees-checkbox-container"),
    ).getByRole("checkbox");

    expect(namesDatesBox).not.toBeChecked();
    expect(permanentRecordBox).not.toBeChecked();
    expect(correctionFeesBox).not.toBeChecked();

    await userEvent.click(namesDatesBox);
    await userEvent.click(permanentRecordBox);
    await userEvent.click(correctionFeesBox);

    expect(namesDatesBox).toBeChecked();
    expect(permanentRecordBox).toBeChecked();
    expect(correctionFeesBox).toBeChecked();

    expect(
      screen.queryByText(Config.formation.sections.review.confirmationBox.confirmationError),
    ).not.toBeInTheDocument();
  });
});
