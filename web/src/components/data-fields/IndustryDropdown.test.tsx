import { renderWithUserData } from "@/test/render/renderWithUserData";
import { IndustryDropdown } from "@/components/data-fields/IndustryDropdown";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, screen, within } from "@testing-library/react";

describe("Industry Dropdown", () => {
  it("displays the Generic Industry as the last item in the dropdown list", () => {
    renderWithUserData(<IndustryDropdown />);

    fireEvent.mouseDown(screen.getByLabelText("Industry"));
    const items = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(within(items[items.length - 1]).getByTestId("generic")).toBeInTheDocument();
  });

  it("displays the generic industry as the single option when there is no industry match", async () => {
    renderWithUserData(<IndustryDropdown />);
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
    renderWithUserData(<IndustryDropdown />);

    const inputElement = screen.getByLabelText("Industry");
    fireEvent.click(inputElement);
    expect(screen.queryByTestId("search-affirmation")).not.toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: "plan" } });
    expect(screen.getByTestId("search-affirmation")).toBeInTheDocument();
  });

  describe("domestic employer industry", () => {
    it("filters out domestic employer industry when businessPersona is 'FOREIGN'", () => {
      renderWithUserData(
        <WithStatefulProfileData
          initialData={generateProfileData({
            businessPersona: "FOREIGN",
          })}
        >
          <IndustryDropdown />
        </WithStatefulProfileData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      expect(screen.queryByTestId("domestic-employer")).not.toBeInTheDocument();
    });

    it("displays domestic employer as an industry when businessPersona is 'STARTING'", () => {
      renderWithUserData(
        <WithStatefulProfileData
          initialData={generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: undefined,
          })}
        >
          <IndustryDropdown />
        </WithStatefulProfileData>,
      );

      fireEvent.mouseDown(screen.getByLabelText("Industry"));
      expect(screen.getByTestId("domestic-employer")).toBeInTheDocument();
    });
  });
});
