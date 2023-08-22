import { StateDropdown } from "@/components/StateDropdown";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<StateDropdown />", () => {
  beforeEach(() => {});

  it("renders list with NJ and US Territories", () => {
    render(
      <StateDropdown value={undefined} fieldName={"test"} onSelect={(): void => {}} excludeNJ={false} />
    );
    fireEvent.click(screen.getByTestId("test"));
    expect(screen.getByText("NJ")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("VI")).toBeInTheDocument();
    expect(screen.getByText("GU")).toBeInTheDocument();
  });

  it("renders list without NJ", () => {
    render(<StateDropdown value={undefined} fieldName={"test"} onSelect={(): void => {}} excludeNJ={true} />);
    fireEvent.click(screen.getByTestId("test"));
    expect(screen.queryByText("NJ")).not.toBeInTheDocument();
  });

  it("renders list without US Territories", () => {
    render(
      <StateDropdown
        value={undefined}
        fieldName={"test"}
        onSelect={(): void => {}}
        excludeTerritories={true}
      />
    );
    fireEvent.click(screen.getByTestId("test"));
    expect(screen.queryByText("AS")).not.toBeInTheDocument();
    expect(screen.queryByText("VI")).not.toBeInTheDocument();
    expect(screen.queryByText("GU")).not.toBeInTheDocument();
  });
});
