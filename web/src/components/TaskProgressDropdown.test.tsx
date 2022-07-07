import { TaskProgressDropdown } from "@/components/TaskProgressDropdown";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { TaskProgress } from "@/lib/types/types";
import { withAuthAlert } from "@/test/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<TaskProgressDropdown />", () => {
  const notStartedText = Config.taskProgress.NOT_STARTED;
  const inProgressText = Config.taskProgress.IN_PROGRESS;
  const completedText = Config.taskProgress.COMPLETED;

  const setModalIsVisible = jest.fn();
  const onSelectCallBack = jest.fn();

  const renderWithAuth = (context: {
    onSelect?: typeof onSelectCallBack;
    value: TaskProgress;
    isAuthenticated?: IsAuthenticated;
    modalIsVisible?: boolean;
  }) => {
    render(
      withAuthAlert(
        <TaskProgressDropdown onSelect={context.onSelect ?? onSelectCallBack} value={context.value} />,
        context.isAuthenticated ?? IsAuthenticated.TRUE,
        { modalIsVisible: context.modalIsVisible ?? false, setModalIsVisible }
      )
    );
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("calls the prop callback when an option is selected", () => {
    renderWithAuth({ value: "NOT_STARTED" });
    fireEvent.click(screen.getAllByText(notStartedText)[0]);
    fireEvent.click(screen.getByText(inProgressText));
    expect(onSelectCallBack).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("uses value prop as initial value", () => {
    renderWithAuth({ value: "COMPLETED" });
    expect(screen.getAllByText(completedText)[0]).toBeVisible();
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    renderWithAuth({ value: "NOT_STARTED", isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getAllByText(notStartedText)[0]);
    fireEvent.click(screen.getByText(inProgressText));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });
});
