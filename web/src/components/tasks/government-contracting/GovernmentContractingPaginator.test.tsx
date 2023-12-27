import { GovernmentContractorPaginator } from "@/components/tasks/government-contracting/GovernmentContractingPaginator";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

describe("<GovernmentContractorPaginator />", () => {
  it("renders first page without clicking stepper", async () => {
    render(<GovernmentContractorPaginator />);
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
  });

  it("renders NJ Start Page", async () => {
    render(<GovernmentContractorPaginator />);
    fireEvent.click(screen.getByTestId("stepper-1"));
    fireEvent.click(screen.getByTestId("stepper-0"));
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
  });

  it("renders Apprenticeship Program", async () => {
    render(<GovernmentContractorPaginator />);
    fireEvent.click(screen.getByTestId("stepper-1"));
    await waitFor(() => {
      expect(screen.getByTestId("apprenticeship-program-intake")).toBeInTheDocument();
    });
  });

  it("renders Public Works", async () => {
    render(<GovernmentContractorPaginator />);
    await waitFor(() => {
      expect(screen.getByTestId("njstart-registration")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("stepper-2"));
    await waitFor(() => {
      expect(screen.getByTestId("public-works-contractor-registration")).toBeInTheDocument();
    });
  });

  it("renders Prevailing Wages", async () => {
    render(<GovernmentContractorPaginator />);
    fireEvent.click(screen.getByTestId("stepper-3"));
    await waitFor(() => {
      expect(screen.getByTestId("prevailing-wage")).toBeInTheDocument();
    });
  });
});
