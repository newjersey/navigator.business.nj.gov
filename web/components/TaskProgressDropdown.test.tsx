import { TaskProgressDropdown } from "./TaskProgressDropdown";
import { fireEvent, render } from "@testing-library/react";

describe("<TaskProgressDropdown />", () => {
  it("displays Not Started as the default", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} />);
    expect(subject.getAllByText("Not started")[0]).toBeVisible();
  });

  it("displays the selected tag when closed", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} />);
    fireEvent.click(subject.getAllByText("Not started")[0]);

    expect(subject.getByText("In-progress")).toBeVisible();
    expect(subject.getByText("Completed")).toBeVisible();
    fireEvent.click(subject.getByText("In-progress"));

    expect(subject.getAllByText("In-progress")[0]).toBeVisible();
    expect(subject.getByText("Completed")).not.toBeVisible();
    expect(subject.getByText("Not started")).not.toBeVisible();
  });

  it("calls the prop callback when an option is selected", () => {
    const callback = jest.fn();
    const subject = render(<TaskProgressDropdown onSelect={callback} />);
    fireEvent.click(subject.getAllByText("Not started")[0]);
    fireEvent.click(subject.getByText("In-progress"));

    expect(callback).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("uses initialValue prop as initial value", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} initialValue="COMPLETED" />);
    expect(subject.getAllByText("Completed")[0]).toBeVisible();
  });
});
