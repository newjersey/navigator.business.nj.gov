import React, { ReactElement } from "react";
import { onEscape, useMountEffect } from "../lib/utils/helpers";
import FocusTrap from "focus-trap-react";

interface Props {
  children: React.ReactNode;
  close: () => void;
  isOpen: boolean;
}

export const FocusTrappedSidebar = ({ children, close, isOpen }: Props): ReactElement => {
  useMountEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      onEscape(event, close);
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  return isOpen ? <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>{children}</FocusTrap> : <></>;
};
