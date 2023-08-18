import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData
} from "@/test/mock/withStatefulUserData";
import { generateUserData } from "@businessnjgovnavigator/shared/";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<TaskCheckbox />", () => {
  let setRegistrationModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    setupStatefulUserDataContext();
  });

  const renderTaskCheckbox = ({
    checklistItemId,
    initialBusiness,
    isAuthenticated
  }: {
    checklistItemId: string;
    initialBusiness?: Business;
    isAuthenticated?: IsAuthenticated;
  }): void => {
    render(
      withAuthAlert(
        <WithStatefulUserData
          initialUserData={
            initialBusiness ? generateUserDataForBusiness(initialBusiness) : generateUserData({})
          }
        >
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
      initialBusiness: generateBusiness({
        taskItemChecklist: {
          "some-id": true,
          "some-other-id": false
        }
      })
    });
    expect(screen.getByRole("checkbox") as HTMLInputElement).toBeChecked();
  });

  it("updates userData when item is checked off", () => {
    renderTaskCheckbox({
      checklistItemId: "some-id",
      initialBusiness: generateBusiness({
        taskItemChecklist: {
          "some-id": false
        }
      })
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox") as HTMLInputElement).toBeChecked();
    expect(currentBusiness().taskItemChecklist["some-id"]).toBe(true);
  });

  it("opens registration modal when guest mode user tries to change state", () => {
    renderTaskCheckbox({
      checklistItemId: "some-id",
      isAuthenticated: IsAuthenticated.FALSE
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
  });
});
