import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { TaskProgress } from "@/lib/types/types";
import { withAuthAlert } from "@/test/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

describe("<TaskProgressDropdown />", () => {
  const notStartedText = Config.taskProgress.NOT_STARTED;
  const inProgressText = Config.taskProgress.IN_PROGRESS;
  const completedText = Config.taskProgress.COMPLETED;

  const setModalIsVisible = jest.fn();
  const onSelectCallBack = jest.fn();

  const renderWithAuth = (context: {
    readonly onSelect?: typeof onSelectCallBack;
    readonly initialValue?: TaskProgress;
    readonly isAuthenticated?: IsAuthenticated;
    readonly modalIsVisible?: boolean;
  }): RenderResult => {
    return render(
      withAuthAlert(
        <TaskProgressDropdown
          onSelect={context.onSelect ?? onSelectCallBack}
          initialValue={context.initialValue}
        />,
        context.isAuthenticated ?? IsAuthenticated.TRUE,
        { modalIsVisible: context.modalIsVisible ?? false, setModalIsVisible }
      )
    );
  };

  let subject: RenderResult;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("displays Not Started as the default", () => {
    subject = renderWithAuth({});
    expect(subject.getAllByText(notStartedText)[0]).toBeVisible();
  });

  it("displays the selected tag when closed", () => {
    subject = renderWithAuth({});
    fireEvent.click(subject.getAllByText(notStartedText)[0]);

    expect(subject.getByText(inProgressText)).toBeVisible();
    expect(subject.getByText(completedText)).toBeVisible();
    fireEvent.click(subject.getByText(inProgressText));

    expect(subject.getAllByText(inProgressText)[0]).toBeVisible();
    expect(subject.getByText(completedText)).not.toBeVisible();
    expect(subject.getByText(notStartedText)).not.toBeVisible();
  });

  it("calls the prop callback when an option is selected", () => {
    subject = renderWithAuth({});
    fireEvent.click(subject.getAllByText(notStartedText)[0]);
    fireEvent.click(subject.getByText(inProgressText));
    expect(onSelectCallBack).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("uses initialValue prop as initial value", async () => {
    subject = renderWithAuth({ initialValue: "COMPLETED" });
    await waitFor(() => expect(subject.getAllByText(completedText)[0]).toBeVisible());
  });

  it("shows a success toast when an option is selected", () => {
    subject = renderWithAuth({});
    fireEvent.click(subject.getAllByText(notStartedText)[0]);

    expect(subject.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).not.toBeInTheDocument();
    fireEvent.click(subject.getByText(inProgressText));
    expect(subject.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    subject = renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(subject.getAllByText(notStartedText)[0]);
    fireEvent.click(subject.getByText(inProgressText));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });
});
