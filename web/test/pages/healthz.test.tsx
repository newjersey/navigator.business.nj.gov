import HealthCheck from "@/pages/healthz";
import { render, screen } from "@testing-library/react";

describe("HealthzPage", () => {
  it("renders correctly", () => {
    render(<HealthCheck />);
    expect(screen.getByText("Application is healthy")).toBeInTheDocument();
  });
});
