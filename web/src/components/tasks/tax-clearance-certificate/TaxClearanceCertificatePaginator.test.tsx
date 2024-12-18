import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  TaxClearanceCertificatePaginator
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificatePaginator";

describe("<TaxClearanceCertificatePaginator />", () => {
  it("renders first page without clicking stepper", async () => {
    render(<TaxClearanceCertificatePaginator />);
    await waitFor(() => {
      expect(screen.getByTestId("Requirements")).toBeInTheDocument();
    });
  });

  it("renders Requirements Page", async () => {
    render(<TaxClearanceCertificatePaginator/>);
    fireEvent.click(screen.getByTestId("stepper-1"));
    fireEvent.click(screen.getByTestId("stepper-0"));
    await waitFor(() => {
      expect(screen.getByTestId("Requirements")).toBeInTheDocument();
    });
  });

  it("renders Check Eligibility Page", async () => {
    render(<TaxClearanceCertificatePaginator/>);
    fireEvent.click(screen.getByTestId("stepper-1"));
    await waitFor(() => {
      expect(screen.getByTestId("Check Eligibility")).toBeInTheDocument();
    });
  });

  it("renders Review Page", async () => {
    render(<TaxClearanceCertificatePaginator/>);
    fireEvent.click(screen.getByTestId("stepper-2"));
    await waitFor(() => {
      expect(screen.getByTestId("Review")).toBeInTheDocument();
    });
  });
});
