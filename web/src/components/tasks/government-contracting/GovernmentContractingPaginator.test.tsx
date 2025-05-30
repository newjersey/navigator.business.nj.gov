import { GovernmentContractorPaginator } from "@/components/tasks/government-contracting/GovernmentContractingPaginator";
import { GovernmentContractingSteps } from "@/components/tasks/government-contracting/GovernmentContractingSteps";
import { loadAnytimeActionTaskByUrlSlug } from "@/lib/static/loadAnytimeActionTasks";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

describe("<GovernmentContractorPaginator />", () => {
  const GovernmentContractingStepsAnytimeActions = GovernmentContractingSteps.map((current) => {
    return loadAnytimeActionTaskByUrlSlug(current.fileName, true);
  });

  it("renders first page without clicking stepper", async () => {
    render(
      <GovernmentContractorPaginator
        governmentContractingStepAnytimeActions={GovernmentContractingStepsAnytimeActions}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
  });

  it("renders NJ Start Page", async () => {
    render(
      <GovernmentContractorPaginator
        governmentContractingStepAnytimeActions={GovernmentContractingStepsAnytimeActions}
      />,
    );
    fireEvent.click(screen.getByTestId("stepper-1"));
    fireEvent.click(screen.getByTestId("stepper-0"));
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
  });

  it("renders Apprenticeship Program", async () => {
    render(
      <GovernmentContractorPaginator
        governmentContractingStepAnytimeActions={GovernmentContractingStepsAnytimeActions}
      />,
    );
    fireEvent.click(screen.getByTestId("stepper-1"));
    await waitFor(() => {
      expect(screen.getByTestId("apprenticeship-program-intake")).toBeInTheDocument();
    });
  });

  it("renders Public Works", async () => {
    render(
      <GovernmentContractorPaginator
        governmentContractingStepAnytimeActions={GovernmentContractingStepsAnytimeActions}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("stepper-2"));
    await waitFor(() => {
      expect(screen.getByTestId("public-works-contractor-registration")).toBeInTheDocument();
    });
  });

  it("renders Prevailing Wages", async () => {
    render(
      <GovernmentContractorPaginator
        governmentContractingStepAnytimeActions={GovernmentContractingStepsAnytimeActions}
      />,
    );
    fireEvent.click(screen.getByTestId("stepper-3"));
    await waitFor(() => {
      expect(screen.getByTestId("prevailing-wage")).toBeInTheDocument();
    });
  });
});
