import { GenericTextField } from "@/components/GenericTextField";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useNeedsAccountLockedField } from "@/lib/data-hooks/useNeedsAccountLockedField";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement, useState } from "react";

const LockedField = (): ReactElement => {
  const lockedFieldProps = useNeedsAccountLockedField();
  const [value, setValue] = useState("");
  return (
    <GenericTextField
      fieldName="taxId"
      ariaLabel="locked field"
      value={value}
      handleChange={setValue}
      {...lockedFieldProps}
    />
  );
};

describe("useNeedsAccountLockedField", () => {
  const setShowNeedsAccountModal = jest.fn();

  const renderLockedField = (isAuthenticated: IsAuthenticated): void => {
    render(
      withNeedsAccountContext(<LockedField />, isAuthenticated, {
        setShowNeedsAccountModal,
      }),
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("when the user is a guest", () => {
    it("marks the field as read only", () => {
      renderLockedField(IsAuthenticated.FALSE);
      expect(screen.getByLabelText("locked field")).toHaveAttribute("readonly");
      expect(screen.getByLabelText("locked field")).toHaveAttribute("aria-readonly", "true");
    });

    it("opens the modal when the field is clicked", () => {
      renderLockedField(IsAuthenticated.FALSE);
      fireEvent.click(screen.getByLabelText("locked field"));
      expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });

    it("does not open the modal when the field only receives focus", () => {
      renderLockedField(IsAuthenticated.FALSE);
      fireEvent.focus(screen.getByLabelText("locked field"));
      expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
    });

    it.each(["Enter", " ", "a", "5"])(
      "opens the modal when the user tries to enter a value with %s",
      (key) => {
        renderLockedField(IsAuthenticated.FALSE);
        fireEvent.keyDown(screen.getByLabelText("locked field"), { key });
        expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      },
    );

    it.each(["Tab", "Escape", "ArrowLeft", "ArrowRight", "Shift"])(
      "does not open the modal when the user presses the navigation key %s",
      (key) => {
        renderLockedField(IsAuthenticated.FALSE);
        fireEvent.keyDown(screen.getByLabelText("locked field"), { key });
        expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
      },
    );

    it.each([
      ["ctrlKey", { ctrlKey: true }],
      ["metaKey", { metaKey: true }],
      ["altKey", { altKey: true }],
    ])("does not open the modal for a %s shortcut", (_label, modifier) => {
      renderLockedField(IsAuthenticated.FALSE);
      fireEvent.keyDown(screen.getByLabelText("locked field"), { key: "r", ...modifier });
      expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
    });
  });

  describe("when the user is authenticated", () => {
    it("leaves the field editable", () => {
      renderLockedField(IsAuthenticated.TRUE);
      expect(screen.getByLabelText("locked field")).not.toHaveAttribute("readonly");
    });

    it("does not open the modal when the field is clicked", () => {
      renderLockedField(IsAuthenticated.TRUE);
      fireEvent.click(screen.getByLabelText("locked field"));
      expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
    });

    it("does not open the modal when the user types", () => {
      renderLockedField(IsAuthenticated.TRUE);
      fireEvent.keyDown(screen.getByLabelText("locked field"), { key: "a" });
      expect(setShowNeedsAccountModal).not.toHaveBeenCalled();
    });

    it("lets the user type into the field", async () => {
      renderLockedField(IsAuthenticated.TRUE);
      await userEvent.type(screen.getByLabelText("locked field"), "5");
      expect(screen.getByLabelText("locked field")).toHaveValue("5");
    });
  });
});
