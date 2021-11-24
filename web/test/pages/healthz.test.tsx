import HealthCheck from "@/pages/healthz";
import { render } from "@testing-library/react";
import React from "react";

describe("HealthzPage", () => {
  it("renders correctly", () => {
    const subject = render(<HealthCheck />).baseElement;
    expect(subject).toMatchSnapshot();
  });
});
