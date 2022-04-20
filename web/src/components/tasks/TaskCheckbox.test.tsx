import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<TaskCheckbox />", () => {
  let setModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setModalIsVisible = jest.fn();
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
        { modalIsVisible: false, setModalIsVisible }
      )
    );
  };

  it("sets checked property from userData for task", () => {
    const subject = renderTaskCheckbox({
      checklistItemId: "some-id",
      initialUserData: generateUserData({
        taskItemChecklist: {
          "some-id": true,
          "some-other-id": false,
        },
      }),
    });
    expect((subject.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });

  it("updates userData when item is checked off", () => {
    const subject = renderTaskCheckbox({
      checklistItemId: "some-id",
      initialUserData: generateUserData({
        taskItemChecklist: {
          "some-id": false,
        },
      }),
    });
    fireEvent.click(subject.getByRole("checkbox"));
    expect((subject.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
    expect(currentUserData().taskItemChecklist["some-id"]).toBe(true);
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    const subject = renderTaskCheckbox({
      checklistItemId: "some-id",
      isAuthenticated: IsAuthenticated.FALSE,
    });
    fireEvent.click(subject.getByRole("checkbox"));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });
});
