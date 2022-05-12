import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { TaskProgress } from "@/lib/types/types";
import { withAuthAlert } from "@/test/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

describe("<TaskProgressDropdown />", () => {
  const notStartedText = Config.taskProgress.NOT_STARTED;
  const inProgressText = Config.taskProgress.IN_PROGRESS;
  const completedText = Config.taskProgress.COMPLETED;

  const setModalIsVisible = jest.fn();
  const onSelectCallBack = jest.fn();

  const renderWithAuth = (context: {
    onSelect?: typeof onSelectCallBack;
    initialValue?: TaskProgress;
    isAuthenticated?: IsAuthenticated;
    modalIsVisible?: boolean;
  }) => {
    render(
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

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("displays Not Started as the default", () => {
    renderWithAuth({});
    expect(screen.getAllByText(notStartedText)[0]).toBeVisible();
  });

  it("displays the selected tag when closed", () => {
    renderWithAuth({});
    fireEvent.click(screen.getAllByText(notStartedText)[0]);

    expect(screen.getByText(inProgressText)).toBeVisible();
    expect(screen.getByText(completedText)).toBeVisible();
    fireEvent.click(screen.getByText(inProgressText));

    expect(screen.getAllByText(inProgressText)[0]).toBeVisible();
    expect(screen.getByText(completedText)).not.toBeVisible();
    expect(screen.getByText(notStartedText)).not.toBeVisible();
  });

  it("calls the prop callback when an option is selected", () => {
    renderWithAuth({});
    fireEvent.click(screen.getAllByText(notStartedText)[0]);
    fireEvent.click(screen.getByText(inProgressText));
    expect(onSelectCallBack).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("uses initialValue prop as initial value", () => {
    renderWithAuth({ initialValue: "COMPLETED" });
    expect(screen.getAllByText(completedText)[0]).toBeVisible();
  });

  it("shows a success toast when an option is selected", () => {
    renderWithAuth({});
    fireEvent.click(screen.getAllByText(notStartedText)[0]);

    expect(screen.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(inProgressText));
    expect(screen.getByText(Config.taskDefaults.taskProgressSuccessToastBody)).toBeInTheDocument();
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    renderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getAllByText(notStartedText)[0]);
    fireEvent.click(screen.getByText(inProgressText));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });
});
