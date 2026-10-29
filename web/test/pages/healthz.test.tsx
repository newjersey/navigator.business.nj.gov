import { render, screen } from "@testing-library/react";
import HealthCheck from "@/pages/healthz";

describe("HealthzPage", () => {
  it("renders correctly", () => {
    render(<HealthCheck />);
    expect(screen.getByText("Application is healthy")).toBeInTheDocument();
  });
});
