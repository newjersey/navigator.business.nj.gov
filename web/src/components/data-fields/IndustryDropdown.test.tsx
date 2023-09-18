import { IndustryDropdown } from "@/components/data-fields/IndustryDropdown";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { fireEvent, render, screen, within } from "@testing-library/react";

describe("Industry Dropdown", () => {
  it("displays the Generic Industry as the first item in the dropdown list", () => {
    render(<IndustryDropdown />);

    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const items = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(within(items[0]).getByTestId("generic")).toBeInTheDocument();
  });

  it("displays the generic industry as the single option when there is no industry match", async () => {
    render(<IndustryDropdown />);
    const searchTerm = `some-industry-${randomInt()}`;

    fireEvent.click(screen.getByLabelText("Industry"));
    fireEvent.change(screen.getByLabelText("Industry"), {
      target: { value: searchTerm },
    });

    fireEvent.click(screen.getByLabelText("Industry"));
    expect(screen.getByTestId("generic")).toBeInTheDocument();
    expect(screen.getAllByText(searchTerm).length).toEqual(1);
    expect(screen.queryByTestId("certified-public-accountant")).not.toBeInTheDocument();
  });

  it("displays search affirmation when there is an input", () => {
    render(<IndustryDropdown />);

    const inputElement = screen.getByLabelText("Industry");
    fireEvent.click(inputElement);
    expect(screen.queryByTestId("search-affirmation")).not.toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: "plan" } });
    expect(screen.getByTestId("search-affirmation")).toBeInTheDocument();
  });
});
