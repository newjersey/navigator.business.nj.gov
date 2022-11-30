import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});

describe("<TaskCheckbox />", () => {
  let setRegistrationModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    setupStatefulUserDataContext();
  });

  const renderTaskCheckbox = ({
    checklistItemId,
    initialUserData,
    isAuthenticated,
  }: {
    checklistItemId: string;
    initialUserData?: UserData;
    isAuthenticated?: IsAuthenticated;
  }) => {
    return render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={initialUserData ?? generateUserData({})}>
          <TaskCheckbox checklistItemId={checklistItemId} />
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { registrationModalIsVisible: false, setRegistrationModalIsVisible }
      )
    );
  };

  it("sets checked property from userData for task", () => {
    renderTaskCheckbox({
      checklistItemId: "some-id",
      initialUserData: generateUserData({
        taskItemChecklist: {
          "some-id": true,
          "some-other-id": false,
        },
      }),
    });
    expect(screen.getByRole("checkbox") as HTMLInputElement).toBeChecked();
  });

  it("updates userData when item is checked off", () => {
    renderTaskCheckbox({
      checklistItemId: "some-id",
      initialUserData: generateUserData({
        taskItemChecklist: {
          "some-id": false,
        },
      }),
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox") as HTMLInputElement).toBeChecked();
    expect(currentUserData().taskItemChecklist["some-id"]).toBe(true);
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    renderTaskCheckbox({
      checklistItemId: "some-id",
      isAuthenticated: IsAuthenticated.FALSE,
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
  });
});
