import HealthCheck from "@/pages/healthz";
import { render } from "@testing-library/react";
import React from "react";

describe("HealthzPage", () => {
  it("renders correctly", () => {
    const view = render(<HealthCheck />).baseElement;
    expect(view).toMatchSnapshot();
  });
});
