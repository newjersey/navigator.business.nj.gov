import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

describe("Industry Dropdown", () => {
  it("displays the Generic Industry as the first item in the dropdown list", () => {
    render(<IndustryDropdown />);

    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const items = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(within(items[0]).getByTestId("generic")).toBeInTheDocument();
  });
});
