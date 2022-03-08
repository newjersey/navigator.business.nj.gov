import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

describe("<TaskProgressDropdown />", () => {
  const notStartedText = Config.taskProgress.NOT_STARTED;
  const inProgressText = Config.taskProgress.IN_PROGRESS;
  const completedText = Config.taskProgress.COMPLETED;

  it("displays Not Started as the default", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} />);
    expect(subject.getAllByText(notStartedText)[0]).toBeVisible();
  });

  it("displays the selected tag when closed", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} />);
    fireEvent.click(subject.getAllByText(notStartedText)[0]);

    expect(subject.getByText(inProgressText)).toBeVisible();
    expect(subject.getByText(completedText)).toBeVisible();
    fireEvent.click(subject.getByText(inProgressText));

    expect(subject.getAllByText(inProgressText)[0]).toBeVisible();
    expect(subject.getByText(completedText)).not.toBeVisible();
    expect(subject.getByText(notStartedText)).not.toBeVisible();
  });

  it("calls the prop callback when an option is selected", () => {
    const callback = jest.fn();
    const subject = render(<TaskProgressDropdown onSelect={callback} />);
    fireEvent.click(subject.getAllByText(notStartedText)[0]);
    fireEvent.click(subject.getByText(inProgressText));

    expect(callback).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("uses initialValue prop as initial value", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} initialValue="COMPLETED" />);
    expect(subject.getAllByText(completedText)[0]).toBeVisible();
  });

  it("shows a success toast when an option is selected", () => {
    const subject = render(<TaskProgressDropdown onSelect={jest.fn()} />);
    fireEvent.click(subject.getAllByText(notStartedText)[0]);

    expect(subject.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).not.toBeInTheDocument();
    fireEvent.click(subject.getByText(inProgressText));
    expect(subject.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
  });
});
