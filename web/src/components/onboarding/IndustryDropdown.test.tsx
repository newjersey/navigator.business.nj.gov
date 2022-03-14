import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { fireEvent, render, within } from "@testing-library/react";
import React from "react";

describe("<IndustryDropdown />", () => {
  beforeEach(() => {
    delete process.env.FEATURE_DISABLE_CANNABIS;
  });

  afterEach(() => {
    delete process.env.FEATURE_DISABLE_CANNABIS;
  });

  it("does not show cannabis when feature flag exists", () => {
    process.env.FEATURE_DISABLE_CANNABIS = "true";
    const subject = render(<IndustryDropdown />);
    fireEvent.mouseDown(subject.getByLabelText("Industry"));
    const listbox = within(subject.getByRole("listbox"));
    expect(listbox.queryByTestId("cannabis")).not.toBeInTheDocument();
  });

  it("shows cannabis when feature flag does not exist", () => {
    const subject = render(<IndustryDropdown />);
    fireEvent.mouseDown(subject.getByLabelText("Industry"));
    const listbox = within(subject.getByRole("listbox"));
    expect(listbox.queryByTestId("cannabis")).toBeInTheDocument();
  });
});
